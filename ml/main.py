from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from predictor import predict_future_price

app = FastAPI(title="Farmer Marketplace ML API")

class PredictionRequest(BaseModel):
    commodity: str
    district: str
    days_ahead: Optional[int] = 30

class PricePoint(BaseModel):
    date: str
    price: int
    confidence: int

class PredictionResponse(BaseModel):
    commodity: str
    district: str
    current_price: Optional[int]
    predictions: List[PricePoint]
    method: str = "python_scikit_learn"

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    predictions, error = predict_future_price(request.commodity, request.district, request.days_ahead)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
        
    return {
        "commodity": request.commodity,
        "district": request.district,
        "predictions": predictions,
        "method": "python_scikit_learn"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
