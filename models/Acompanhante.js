const mongoose = require("mongoose");
const validator = require("validator");
require("dotenv").config();



const AcompanhanteSchema = new mongoose.Schema(
  {
    //_id: mongoose.Schema.Types.ObjectId,
    nomePerfil: { type: String, required: false },
    slug: { type: String, required: true },
    email: { type: String, default: "", required: true },
    bio: { type: String, default: "", required: false },
    imagens: [{ type: String, default: "", required: false }],
    imageprincipal: { type: String, default: "", required: false },
    imagecover: { type: String, default: "", required: false },
    //hash: { type: String, default: "valorDefault", required: false },
    //salt: { type: String, default: "valorDefault", required: false },
    video: { type: String, default: "", required: false },
    contactoTelefonico: {
      type: String,
      default: "",
      required: false,
    },
    idade: { type: Number, default: 0, required: false },
    olhos: { type: String, default: "", required: false },
    cabelo: { type: String, default: "", required: false },
    paisdeorigem: { type: String, default: "", required: false },
    altura: { type: Number, default: 0, required: false },
    peso: { type: String, default: "", required: false },
    tatuagens: { type: String, default: "", required: false },
    idiomas: [{ type: String, default: "", required: false }],
    tipodeatendimento: [{ type: String, default: "", required: false }],
    atendimento: [{ type: String, default: "", required: false }],
    concelho_name: { type: String, default: "", required: false },
    distrito_name: { type: String, default: "", required: false },
    concelho_slug: { type: String, default: "", required: false },
    distrito_slug: { type: String, default: "", required: false },
    eventos: [{ type: String, default: "", required: false }],
    servicos: [{ type: String, default: "", required: false }],
    sessaodefotos: { type: String, default: "", required: false },
    viajaraconvite: { type: String, default: "", required: false },
    visualizacoes: { type: Number, default: 0, required: false },
    cliqueswhatsapp: { type: Number, default: 0, required: false },
    destaquepaginaprincipal: { type: Boolean, default: false, required: false },
    destaquenalocalizacao: { type: Boolean, default: false, required: false },
    onlineagora: { type: String, default: "nao", required: false },
    webcam: { type: String, default: "nao", required: false },
    horarioninicio: { type: String, default: "", required: false },
    horariofim: { type: String, default: "", required: false },
    diasatendimento: [{ type: String, default: "", required: false }],
    atendimentocompleto: { type: String, default: "nao", required: false },
    idanunciante: { type: String, default: "", required: true },
    anuncioverificado: { type: Boolean, default: false},
    atende24horas: { type: Boolean, default: false},
    datainicioanuncio: { type: Date, default:  () => Date.now()},
    datafimanuncio: { type: Date, default:  () => Date.now() + 30*24*60*60*1000},
  },
  { timestamps: true }
);


module.exports = mongoose.model("Acompanhante", AcompanhanteSchema);
