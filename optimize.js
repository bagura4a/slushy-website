import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = './public/images';

async function optimize() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
      const filePath = path.join(dir, file);
      const tmpPath = path.join(dir, 'tmp_' + file);
      
      await sharp(filePath)
        .resize(400) // resize to max 400px width
        .webp({ quality: 80 })
        .toFile(tmpPath);
        
      // Replace original file with optimized webp, but keep .png extension for now so code doesn't break
      // Wait, let's keep it as webp but rename to .png so we don't have to rewrite the code yet
      fs.renameSync(tmpPath, filePath);
      console.log(`Optimized ${file}`);
    }
  }
}

optimize().catch(console.error);
