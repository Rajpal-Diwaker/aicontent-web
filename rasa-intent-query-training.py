from rasa_nlu.training_data import load_data
from rasa_nlu.config import RasaNLUModelConfig
from rasa_nlu.model import Trainer
from rasa_nlu import config

train_data = load_data('data-model/nlu.md')

trainer = Trainer(config.load("nlu_config.yaml"))

trainer.train(train_data)

model_directory = trainer.persist('/models')