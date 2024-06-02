import pandas as pd

df = pd.read_csv('Dataset1_PreventableMortality/preventable_mortality.csv')

#filtered_df = df[
#    (df['Variable'] == "Preventable mortality") &
#    (df['Measure'] == "Deaths per 100 000 population (standardised rates)")
#]
countries = ['Mexico', 'Peru', 'Lithuania', 'Israel', 'Austria', 'Estonia', 'United States', 'Latvia', 'Australia']
df = df[df['Measure'] == "Deaths per 100 000 population (standardised rates)"]
df = df[df['Variable'] == "Preventable mortality"]
df = df[df['Year'] <= 2020]
df = df[df['Country'].isin(countries)]

required_years = set(range(2010, 2021))

filtered_df = df.groupby('Country').filter(lambda x: required_years.issubset(x['Year'].unique()))

filtered_df = filtered_df.drop(columns=["VAR", "UNIT", "COU", "YEA", "Flag Codes", "Flags"])


filtered_df.to_csv('Dataset1_PreventableMortality/preventable_mortality_cleaned.csv', index=False)

print("Filtered data saved to 'preventable_mortality_cleaned.csv'")
