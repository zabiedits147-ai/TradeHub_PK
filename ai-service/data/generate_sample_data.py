import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Generate 12 months of dummy sales data for testing Prophet
np.random.seed(42)
start_date = datetime(2025, 7, 1)
dates = [start_date + timedelta(days=i) for i in range(365)]

# Simulate sales with weekly seasonality + upward trend + noise
base_sales = 50
trend = np.linspace(0, 30, 365)
weekly_pattern = [10 if d.weekday() in [4, 5] else 0 for d in dates]  # higher on Fri/Sat
noise = np.random.normal(0, 8, 365)

sales = base_sales + trend + weekly_pattern + noise
sales = np.clip(sales, 5, None).round().astype(int)

df = pd.DataFrame({'ds': dates, 'y': sales})

os.makedirs('data', exist_ok=True)
df.to_csv('data/sample_sales.csv', index=False)
print(f"Generated {len(df)} rows of sample sales data at data/sample_sales.csv")