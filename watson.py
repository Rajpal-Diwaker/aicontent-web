from ibm_watson import DiscoveryV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

authenticator = IAMAuthenticator('FRDJkAQHEYaS60oA2xWIuyiDYV5OZy8cq39CIO9XqH6C')
discovery = DiscoveryV1(
            version='2018-12-03',
            authenticator=authenticator
        )

discovery.set_service_url('https://api.us-east.discovery.watson.cloud.ibm.com/instances/a607376e-f525-41dd-ba40-d49dc3cfaa97')

result = discovery.query(
    environment_id='system',
    collection_id='news-en',
    deduplicate=True,
    highlight=True,
    passages=True,
    natural_language_query='trends on facebook ads'
)

print(type(result))

