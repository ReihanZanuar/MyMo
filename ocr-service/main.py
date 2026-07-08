from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pytesseract
import numpy as np
from PIL import Image
import cv2
import io
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MyMo OCR Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ocr"
    }

@app.post("/ocr")
async def process_ocr(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if image.mode != 'RGB':
            image = image.convert('RGB')

        image_np = np.array(image)

        logger.info(f"Processing image: {file.filename}, size: {image.size}")

        # Scale up image 2x for better OCR accuracy on small text
        height, width = image_np.shape[:2]
        scaled = cv2.resize(image_np, (width * 2, height * 2), interpolation=cv2.INTER_CUBIC)
        logger.info(f"Scaled image to: {scaled.shape[1]}x{scaled.shape[0]}")

        # Convert to PIL Image for pytesseract
        scaled_pil = Image.fromarray(scaled)

        # Use Tesseract with Indonesian and English languages
        # PSM 3 = fully automatic page segmentation (better for various layouts)
        custom_config = r'--oem 3 --psm 3'
        extracted_text = pytesseract.image_to_string(
            scaled_pil,
            lang='ind+eng',
            config=custom_config
        )

        logger.info(f"OCR completed. Extracted text length: {len(extracted_text)}")
        logger.info(f"=== EXTRACTED TEXT ===")
        for i, line in enumerate(extracted_text.split('\n')[:50]):  # Log first 50 lines
            logger.info(f"Line {i}: {line}")
        logger.info(f"=== END EXTRACTED TEXT ===")

        return JSONResponse(content={
            "success": True,
            "text": extracted_text
        })

    except Exception as e:
        logger.error(f"OCR processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
