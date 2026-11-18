import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  AnalyzedPage,
  AnalysisProgress,
  GlobalQuoteConfig,
  PageCategory,
  UploadedDocument,
} from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const THUMB_WIDTH = 130;
const THUMB_HEIGHT = 170;

/**
 * Extrae cobertura de tinta total y cobertura de color desde un canvas RGBA.
 * - Brillo medio > 240: papel / fondo blanco
 * - Brillo medio <= 240: píxel de tinta
 * - Color: (max(R,G,B) - min(R,G,B)) > 30
 */
function analyzeCanvasPixels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { totalInkPct: number; colorPct: number; rawCategory: PageCategory } {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  if (totalPixels === 0) {
    return { totalInkPct: 0, colorPct: 0, rawCategory: 'bn_normal' };
  }

  let inkPixels = 0;
  let colorPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    // Transparente equivale a papel blanco
    if (a < 15) continue;

    // Mezcla simple sobre blanco si hay semi-transparencia
    const alpha = a / 255;
    const r = data[i] * alpha + 255 * (1 - alpha);
    const g = data[i + 1] * alpha + 255 * (1 - alpha);
    const b = data[i + 2] * alpha + 255 * (1 - alpha);

    const brightness = (r + g + b) / 3;
    if (brightness <= 240) {
      inkPixels++;
      const maxCh = Math.max(r, g, b);
      const minCh = Math.min(r, g, b);
      if (maxCh - minCh > 30) {
        colorPixels++;
      }
    }
  }

  const totalInkPct = (inkPixels / totalPixels) * 100;
  const colorPct = (colorPixels / totalPixels) * 100;

  let rawCategory: PageCategory;
  if (colorPct > 0) {
    rawCategory = colorPct <= 35.0 ? 'color_media' : 'color_full';
  } else {
    rawCategory = totalInkPct > 50.0 ? 'bn_pesada' : 'bn_normal';
  }

  return { totalInkPct, colorPct, rawCategory };
}

/**
 * Crea miniatura JPG 130x170px centrada en fondo blanco.
 */
function createThumbnailFromCanvas(sourceCanvas: HTMLCanvasElement): string {
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = THUMB_WIDTH;
  thumbCanvas.height = THUMB_HEIGHT;
  const ctx = thumbCanvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

  const scale = Math.min(
    THUMB_WIDTH / sourceCanvas.width,
    THUMB_HEIGHT / sourceCanvas.height
  );
  const drawW = sourceCanvas.width * scale;
  const drawH = sourceCanvas.height * scale;
  const offsetX = (THUMB_WIDTH - drawW) / 2;
  const offsetY = (THUMB_HEIGHT - drawH) / 2;

  ctx.drawImage(sourceCanvas, offsetX, offsetY, drawW, drawH);
  return thumbCanvas.toDataURL('image/jpeg', 0.82);
}

async function analyzeImageFile(
  file: File,
  fastMode: boolean,
  config: GlobalQuoteConfig
): Promise<UploadedDocument> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`No se pudo cargar la imagen ${file.name}`));
      el.src = objectUrl;
    });

    // Escalar para análisis rápido y preciso (máx 800px de lado mayor)
    const maxDim = 800;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Contexto 2D no disponible');
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const thumbnailDataUrl = createThumbnailFromCanvas(canvas);

    let pages: AnalyzedPage[];
    if (fastMode) {
      pages = [
        {
          pageNumber: 1,
          totalInkPct: 10,
          colorPct: 0,
          rawCategory: 'bn_normal',
        },
      ];
    } else {
      const result = analyzeCanvasPixels(ctx, width, height);
      pages = [
        {
          pageNumber: 1,
          ...result,
        },
      ];
    }

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      fileType: 'image',
      fileSize: file.size,
      totalPages: 1,
      thumbnailDataUrl,
      analyzedFast: fastMode,
      pages,
      sides: config.sides,
      inkOverride: 'auto',
      sets: config.sets,
      includeBinding: config.includeBinding,
      bindingSets: config.includeBinding ? config.bindingSets : 0,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function analyzePdfFile(
  file: File,
  fastMode: boolean,
  config: GlobalQuoteConfig,
  onPageProgress: (page: number, total: number) => void
): Promise<UploadedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  let thumbnailDataUrl: string | null = null;
  const pages: AnalyzedPage[] = [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Contexto 2D no disponible');
  }

  if (fastMode) {
    // Solo renderizar portada (página 1) para miniatura
    onPageProgress(1, totalPages);
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 0.45 });
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await firstPage.render({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    thumbnailDataUrl = createThumbnailFromCanvas(canvas);
    firstPage.cleanup();

    for (let i = 1; i <= totalPages; i++) {
      pages.push({
        pageNumber: i,
        totalInkPct: 10,
        colorPct: 0,
        rawCategory: 'bn_normal',
      });
    }
    onPageProgress(totalPages, totalPages);
  } else {
    // Análisis completo página por página
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onPageProgress(pageNum, totalPages);
      const page = await pdf.getPage(pageNum);
      // Escala 0.5 para excelente balance entre precisión de cobertura y velocidad
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      }).promise;

      if (pageNum === 1) {
        thumbnailDataUrl = createThumbnailFromCanvas(canvas);
      }

      const result = analyzeCanvasPixels(ctx, canvas.width, canvas.height);
      pages.push({
        pageNumber: pageNum,
        ...result,
      });

      page.cleanup();
    }
  }

  await loadingTask.destroy();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    fileType: 'pdf',
    fileSize: file.size,
    totalPages,
    thumbnailDataUrl,
    analyzedFast: fastMode,
    pages,
    sides: config.sides,
    inkOverride: 'auto',
    sets: config.sets,
    includeBinding: config.includeBinding,
    bindingSets: config.includeBinding ? config.bindingSets : 0,
  };
}

export async function processUploadedFiles(
  fileList: File[],
  config: GlobalQuoteConfig,
  onProgress: (progress: AnalysisProgress) => void
): Promise<{ docs: UploadedDocument[]; errors: string[] }> {
  const validFiles = fileList.filter((f) => {
    const ext = f.name.toLowerCase();
    return (
      ext.endsWith('.pdf') ||
      ext.endsWith('.png') ||
      ext.endsWith('.jpg') ||
      ext.endsWith('.jpeg')
    );
  });

  const errors: string[] = [];
  if (validFiles.length < fileList.length) {
    errors.push(
      'Algunos archivos fueron omitidos (solo se admiten PDF, PNG, JPG y JPEG).'
    );
  }

  const docs: UploadedDocument[] = [];
  const totalFiles = validFiles.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = validFiles[i];
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    onProgress({
      active: true,
      percent: Math.round((i / totalFiles) * 100),
      currentFile: file.name,
      currentPage: 1,
      totalPages: 1,
    });

    try {
      if (isPdf) {
        const doc = await analyzePdfFile(
          file,
          config.ignoreBlackPages,
          config,
          (page, total) => {
            const fileFraction = page / Math.max(1, total);
            const overallPercent = Math.min(
              99,
              Math.round(((i + fileFraction) / totalFiles) * 100)
            );
            onProgress({
              active: true,
              percent: overallPercent,
              currentFile: file.name,
              currentPage: page,
              totalPages: total,
            });
          }
        );
        docs.push(doc);
      } else {
        const doc = await analyzeImageFile(file, config.ignoreBlackPages, config);
        docs.push(doc);
      }
    } catch (err) {
      errors.push(
        `Error al procesar "${file.name}": ${
          err instanceof Error ? err.message : 'Archivo no legible'
        }`
      );
    }
  }

  onProgress({
    active: false,
    percent: 100,
    currentFile: '',
    currentPage: 0,
    totalPages: 0,
  });

  return { docs, errors };
}
