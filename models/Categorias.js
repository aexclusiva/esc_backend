const mongoose = require("mongoose");

const categoriasSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  slug: { type: String, required: true },
  subcategorias: { type: String },
  quantidadepropriedades: { type: Number, default: 0 },
});

module.exports = mongoose.model("categorias", categoriasSchema);
