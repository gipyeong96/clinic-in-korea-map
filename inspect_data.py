import pandas as pd

# Load the first sheet of the Excel file
df = pd.read_excel('data/1.병원정보서비스(2026.6.).xlsx', nrows=5)

print("Columns in 1.병원정보서비스(2026.6.).xlsx:")
print(df.columns.tolist())
print("\nFirst 2 rows:")
print(df.head(2).to_dict('records'))

