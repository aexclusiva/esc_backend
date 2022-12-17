const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DistritosSchema = new Schema({
  datasetid: { type: String, required: true },
  codigo_distrito: { type: String, required: true },
  slug_distrito: { type: String, required: true },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  nome: { type: String, required: true },
  foto_560_515: { type: String, required: false, default: ""},
  foto_560_715: { type: String, required: false, default: ""},
  foto_560_400: { type: String, required: false, default: ""},
  propriedades:  { type: Number, default: 0 },
});

const localizacao_distritos = mongoose.model("localizacao_distritos", DistritosSchema);
module.exports = localizacao_distritos;

