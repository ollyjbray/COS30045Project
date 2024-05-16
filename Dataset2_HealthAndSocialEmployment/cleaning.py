import pandas as pd

df = pd.read_csv('Dataset2_HealthAndSocialEmployment/health_social_employment.csv')

df = df[df['Measure'] == "% of total civilian employment"]


df = df[df['Year'] <= 2020]

required_years = set(range(2010, 2021)) 

filtered_df = df.groupby('Country').filter(lambda x: required_years.issubset(x['Year'].unique()))

filtered_df = filtered_df.drop(columns=["VAR", "UNIT", "COU", "YEA", "Flag Codes", "Flags"])


filtered_df.to_csv('Dataset2_HealthAndSocialEmployment/health_social_employment_cleaned.csv', index=False)

print("Filtered data saved to 'health_social_employment_cleaned.csv'")
