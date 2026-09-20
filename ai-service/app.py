from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from prophet import Prophet
import os
import cv2
import numpy as np
import base64
import requests

app = Flask(__name__)
CORS(app)

DATA_PATH = 'data/sample_sales.csv'

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'TradeHub PK AI Predictor Service is running'})

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Expects JSON: { "periods": 30 }  (number of future days to forecast)
    Optionally: { "salesData": [{"ds": "2025-01-01", "y": 45}, ...] }
    If no salesData provided, uses sample_sales.csv for demo purposes.
    """
    try:
        req_data = request.get_json() or {}
        periods = req_data.get('periods', 30)
        custom_data = req_data.get('salesData')

        if custom_data:
            df = pd.DataFrame(custom_data)
        else:
            if not os.path.exists(DATA_PATH):
                return jsonify({'error': 'No sample data found. Run generate_sample_data.py first.'}), 400
            df = pd.read_csv(DATA_PATH)

        df['ds'] = pd.to_datetime(df['ds'])

        model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
        model.fit(df)

        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        # Return only the forecasted (future) portion
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
        result['ds'] = result['ds'].dt.strftime('%Y-%m-%d')

        # Calculate growth trend summary
        recent_avg = df['y'].tail(30).mean()
        predicted_avg = result['yhat'].mean()
        growth_pct = round(((predicted_avg - recent_avg) / recent_avg) * 100, 1)

        return jsonify({
            'forecast': result.to_dict(orient='records'),
            'summary': {
                'recentAverage': round(recent_avg, 0),
                'predictedAverage': round(predicted_avg, 0),
                'growthPercent': growth_pct,
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_image_histogram(image):
    """Compute a color histogram for an image (used for similarity comparison)."""
    hist = cv2.calcHist([image], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
    cv2.normalize(hist, hist)
    return hist.flatten()


def decode_base64_image(base64_string):
    """Decode a base64 image string into an OpenCV image."""
    img_data = base64.b64decode(base64_string)
    img_array = np.frombuffer(img_data, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return image


@app.route('/api/visual-search', methods=['POST'])
def visual_search():
    """
    Expects JSON: { "image": "base64_string", "products": [{"id": "...", "imageUrl": "..."}] }
    Returns products sorted by visual similarity to the uploaded image.
    """
    try:
        req_data = request.get_json()
        base64_image = req_data.get('image')
        products = req_data.get('products', [])

        if not base64_image:
            return jsonify({'error': 'No image provided'}), 400

        query_image = decode_base64_image(base64_image)
        if query_image is None:
            return jsonify({'error': 'Could not decode image'}), 400

        query_hist = get_image_histogram(query_image)

        results = []
        for product in products:
            image_url = product.get('imageUrl')
            if not image_url:
                continue
            try:
                resp = requests.get(image_url, timeout=5)
                img_array = np.frombuffer(resp.content, dtype=np.uint8)
                product_image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                if product_image is None:
                    continue
                product_hist = get_image_histogram(product_image)

                similarity = cv2.compareHist(query_hist, product_hist, cv2.HISTCMP_CORREL)
                results.append({
                    'productId': product.get('id'),
                    'similarity': round(float(similarity), 4),
                })
            except Exception:
                continue

        results.sort(key=lambda x: x['similarity'], reverse=True)

        return jsonify({'matches': results[:10]})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')