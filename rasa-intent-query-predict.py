import sys
import random 

user_query = sys[1]
from rasa_nlu.model import Metadata, Interpreter

model_directory = './models/current/nlu'
interpreter = Interpreter.load(model_directory)

interpreted_dict = interpreter.parse(user_query)
entities_extracted = []

for key, value in interpreted_dict.items(): 
    if(key == "entities"):
        entities_extracted = value

print(entities_extracted)

# pickle_in = open("data-model/df.pkl","rb")
# example_dict = pickle.load(pickle_in)

# index = random.randrange(2, 100, 3)

# print(example_dict[index]) 
exit()        