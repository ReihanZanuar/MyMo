import easyocr

print("Downloading EasyOCR models for Indonesian and English...")
reader = easyocr.Reader(['id', 'en'], gpu=False)
print("Models downloaded successfully!")
