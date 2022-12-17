const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ComodidadesSchema = new Schema({
  nome: { type: String, required: true },
  slug: { type: String, required: true },
  quantidadepropriedades: { type: Number, default: 0 },
});

const Comodidade = mongoose.model("Comodidade", ComodidadesSchema);
module.exports = Comodidade;

