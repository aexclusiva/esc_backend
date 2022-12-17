const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FreguesiaSchema = new Schema({
  distrito: { type: String, required: true },
  concelho: { type: String, required: true },
  nome_freguesia: { type: String, required: true },
  slug_freguesia: { type: String, required: true },
  codigo_freguesia: { type: String, required: true },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  codigo_concelho: { type: String, required: true },
  foto_560_515: { type: String, required: false, default: ""},
  foto_560_715: { type: String, required: false, default: ""},
  foto_560_400: { type: String, required: false, default: ""},
  propriedades:  { type: Number, default: 0 },
});

const localizacao_freguesias = mongoose.model("localizacao_freguesias", FreguesiaSchema);
module.exports = localizacao_freguesias;

