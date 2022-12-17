var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var morgan = require("morgan");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const jwtSecret = process.env.JWT_SECRET;
const cors = require("cors");
//var indexRouter = require("./routes/index");
const mongoose = require("mongoose");
const Categorias = require("./models/Categorias");
const Comodidades = require("./models/Comodidades");
const localizacao_distritos = require("./models/Distritos");
const localizacao_concelhos = require("./models/Concelhos");
const localizacao_freguesias = require("./models/Freguesias");
const Acompanhante = require("./models/Acompanhante");
const utilizadorNormal = require("./models/Utilizador");

const cloudinary = require("cloudinary").v2;

//Cloudinary
cloudinary.config({
  cloud_name: "dsxwpkxdz",
  api_key: "825621329652587",
  api_secret: "84g20ZjdrwxRD31KzABaY6NA2qg",
});

//require("./config/passport");

//var usersRouter = require("./routes/api/users");
// Set up default mongoose connection
const mongoDB = process.env.DATABASE_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var app = express();

// view engine setupp
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cors({ credentials: true, origin: true }));
app.use(morgan("tiny"));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(jwtSecret));
app.use(express.static(path.join(__dirname, "public")));

//app.use("/apiswagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//app.use("/", indexRouter);
//app.use("/", usersRouter);
//app.use(require('./routes'));

const viewRouter = require("./routes/Auth/viewRouter");
const authRouter = require("./routes/Auth/authRouter");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

app.get("/acompanhantes-de-luxo", async (req, res) => {
  const match = {};

  if (req.query.distrito) {
    match.distrito_slug = req.query.distrito;
  }

  if (req.query.concelho) {
    match.concelho_slug = req.query.concelho;
  }

  if (req.query.webcam) {
    match.webcam = req.query.webcam;
  }
  if (req.query.minidade) {
    match.idade = { $gte: req.query.minidade };
  }

  if (req.query.maxidade) {
    match.idade = { $gte: req.query.maxidade };
  }
  if (req.query.minidade && req.query.maxidade) {
    match.idade = { $gte: req.query.minidade, $lte: req.query.maxidade };
  }

  if (req.query.minaltura) {
    let minimoAltura = req.query.minaltura * 0.1;
    match.altura = { $gte: minimoAltura };
  }

  if (req.query.maxaltura) {
    let maximoAltura = req.query.maxaltura * 0.1;
    match.altura = { $gte: maximoAltura };
  }
  if (req.query.minaltura && req.query.maxaltura) {
    match.altura = {
      $gte: parseInt(req.query.minaltura) / 10,
      $lte: parseInt(req.query.maxaltura) / 10,
    };
  }
  if (req.query.olhos) {
    match.olhos = req.query.olhos;
  }
  if (req.query.cabelo) {
    match.cabelo = req.query.cabelo;
  }
  if (req.query.paisdeorigem) {
    match.paisdeorigem = req.query.paisdeorigem;
  }
  if (req.query.atende24horas) {
    match.atende24horas = req.query.atende24horas;
  }
  if (req.query.atendcomp) {
    match.atendimentocompleto = "sim";
  }
  if (req.query.atendimento) {
    match.tipodeatendimento = req.query.atendimento;

    if (req.query.atendimento === "todos") {
      match.tipodeatendimento = { $all: ["incalls", "outcalls"] };
    }
  }

  console.log("query: " + JSON.stringify(match));
  const todasAcompanhantes = await Acompanhante.find(match);
  return res.status(200).json(todasAcompanhantes);
});

app.get("/acompanhantes-de-luxo/total", async (req, res) => {
  const todasAcompanhantes = await Acompanhante.find();
  return res.status(200).json(todasAcompanhantes);
});

app.get("/acompanhantes-de-luxo/pesquisa/:search", async (req, res) => {
  const { search } = req.params;
  let filteredsearch = search.toLocaleLowerCase();

  console.log('Query: ' + filteredsearch)
  const todasAcompanhantes = await Acompanhante.find({"nomePerfil" : { '$regex': filteredsearch, '$options': 'i' }});
  return res.status(200).json(todasAcompanhantes);
});

//obter em destaque
app.get("/acompanhantes-de-luxo/emdestaque", async (req, res) => {
  const match = {};
  let sortquery = {};

  if (req.query.distrito) {
    match.distrito_slug = req.query.distrito;
  }

  if (req.query.concelho) {
    match.concelho_slug = req.query.concelho;
  }

  if (req.query.destaquenalocalizacao) {
    match.destaquenalocalizacao = req.query.destaquenalocalizacao;
  }

  if (req.query.sort) {
    sortquery = { createdAt: req.query.sort };
  }

  console.log("query: " + JSON.stringify(match));
  const todasAcompanhantes = await Acompanhante.find(match)
    .sort(sortquery)
    .limit(4);
  return res.status(200).json(todasAcompanhantes);
});

//obter onlineagora
app.get("/acompanhantes-de-luxo/disponivelagora", async (req, res) => {
  const match = {};

  if (req.query.distrito) {
    match.distrito_slug = req.query.distrito;
  }

  if (req.query.concelho) {
    match.concelho_slug = req.query.concelho;
  }

  match.onlineagora = "sim";

  console.log("query: " + JSON.stringify(match));
  const todasAcompanhantes = await Acompanhante.find(match).limit(4);
  return res.status(200).json(todasAcompanhantes);
});

//obter novidades
app.get("/acompanhantes-de-luxo/novidades", async (req, res) => {
  const match = {};
  let sortquery = {};

  if (req.query.distrito) {
    match.distrito_slug = req.query.distrito;
  }

  if (req.query.concelho) {
    match.concelho_slug = req.query.concelho;
  }

  console.log("query: " + JSON.stringify(match));
  const todasAcompanhantes = await Acompanhante.find(match)
    .sort(sortquery)
    .limit(4);
  return res.status(200).json(todasAcompanhantes);
});

app.get(
  "/acompanhantes-de-luxo/byanunciante/:idanunciante",
  async (req, res) => {
    const { idanunciante } = req.params;
    const acompanhante = await Acompanhante.findOne({
      idanunciante: idanunciante,
    });

    //increment views.
    return res.status(200).json(acompanhante);
  }
);

app.get("/acompanhantes-de-luxo/:slug", async (req, res) => {
  const { slug } = req.params;
  const acompanhante = await Acompanhante.findOne({ slug: slug });

  //increment views.
  await Acompanhante.updateOne({ slug: slug }, { $inc: { visualizacoes: 1 } });
  return res.status(200).json(acompanhante);
});

app.post("/acompanhantes-de-luxo", async (req, res) => {
  const novaAcompanhante = new Acompanhante({ ...req.body });
  const insertedAcompanhante = await novaAcompanhante.save();
  console.log(req.body);

  return res.status(201).json(insertedAcompanhante);
});
app.put("/acompanhantes-de-luxo/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: id };
  let acompanhanteResult = await Acompanhante.findOneAndUpdate(
    filter,
    req.body
  );
  return res.status(200).json(acompanhanteResult);
});
app.delete("/acompanhantes-de-luxo/:id", async (req, res) => {
  const { id } = req.params;
  const deletedAcompanhante = await Acompanhante.findByIdAndDelete(id);
  return res.status(200).json(deletedAcompanhante);
});

//Get destaque Pagina principal
app.get("/acompanhantes-de-luxo/destaque/paginaprincipal", async (req, res) => {
  const update = { $inc: { visualizacoes: 1 } };
  const acompanhante = await Acompanhante.findOneAndUpdate(
    {
      destaquepaginaprincipal: true,
    },
    update
  );

  return res.status(200).json(acompanhante);
});

app.get("/acompanhantes-de-luxo/distrito/:distrito", async (req, res) => {
  const { distrito } = req.params;
  const acompanhante = await Acompanhante.find({ distrito: distrito });
  return res.status(200).json(acompanhante);
});

app.get("/acompanhantes-de-luxo/concelho/:concelho", async (req, res) => {
  const { concelho } = req.params;
  const acompanhante = await Acompanhante.find({ concelho: concelho });
  return res.status(200).json(acompanhante);
});

//app.use("/api/users", authRoute);
app.use("/", viewRouter);
app.use("/auth/", authRouter);
//testing
//const { adminAuth, userAuth } = require("./middleware/auth.js");
//app.get("/admin", adminAuth, (req, res) => res.send("Admin Route"));
//app.get("/basic", userAuth, (req, res) => res.send("User Route"));

//finish tests
app.get("/", (req, res) => {
  return res.json({ message: "Servidor em funcionamento! ✌️" });
});

app.get("/utilizador", async (req, res) => {
  const allUtilizadores = await utilizadorNormal.find();
  return res.status(200).json(allUtilizadores);
});
app.get("/utilizador/:id", async (req, res) => {
  const { id } = req.params;
  const utilizador = await utilizadorNormal.findById(id);
  return res.status(200).json(utilizador);
});
app.post("/utilizador", async (req, res) => {
  const newUtilizador = new utilizadorNormal({ ...req.body });
  const insertedUtilizador = await newUtilizador.save();
  return res.status(201).json(insertedUtilizador);
});
app.put("/utilizador/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: id };
  await utilizadorNormal.findOneAndUpdate(filter, req.body);
  const updatedUtilizador = await utilizadorNormal.findById(id);
  return res.status(200).json(updatedUtilizador);
});
app.delete("/utilizador/:id", async (req, res) => {
  const { id } = req.params;
  const deletedUtilizador = await utilizadorNormal.findByIdAndDelete(id);
  return res.status(200).json(deletedUtilizador);
});

//test endpoint
app.get("/test", async (req, res) => {
  return res.json({ message: "Servidor em funcionamento! ✌️" });
});

// /** -- Endpoints de Propriedades --  */
// app.get("/propriedades", async (req, res) => {
//   const allPropriedades = await Propriedade.find(match);
//   return res.status(200).json(allPropriedades);
// });

// /** -- Endpoints de Propriedades --  */
// app.get("/pesquisa/comprar", async (req, res) => {
//   console.log("triggered this");
//   const match = {};

//   //default mais recente primeiro caso nao haja
//   let sortquery = {datadecriacao: "asc"};

//   match.tipodenegocio = "vender";

//   console.log(req.query);

//   if (req.query.sortby) {
//     console.log("triggered sortby");

//     //Mais barato primeiro
//     if (req.query.sortby === "priceasc") {
//       sortquery = { preco: "asc" };
//     }

//     //Mais caro primeiro
//     if (req.query.sortby === "pricedesc") {
//       sortquery = { preco: "desc" };
//     }

//     //Mais recente
//     if (req.query.sortby === "createdasc") {
//       sortquery = { datadecriacao: "asc" };
//     }

//     //Mais antigo
//     if (req.query.sortby === "createddesc") {
//       sortquery = { datadecriacao: "desc" };
//     }

//     // Mais barato primeiro
//     // &sortby=priceasc

//     // Mais caro primeiro
//     // &sortby=pricedesc
//   }

//   if (req.query.categoria) {
//     match.categoria = req.query.categoria;
//   }
//   if (req.query.distrito) {
//     match.Nomedistrito = req.query.distrito;
//   }
//   if (req.query.concelho) {
//     match.Nomeconcelho = req.query.concelho;
//   }
//   if (req.query.freguesia) {
//     match.Nomefreguesia = req.query.freguesia;
//   }

//   if (req.query.precomin) {
//     match.preco = { $gte: req.query.precomin };
//   }
//   if (req.query.precomax) {
//     match.preco = { $lte: req.query.precomax };
//   }
//   if (req.query.precomin && req.query.precomax) {
//     match.preco = { $gte: req.query.precomin, $lte: req.query.precomax };
//   }
//   if (req.query.tipologia) {
//     match.tipologia = req.query.tipologia;
//   }
//   if (req.query.areautil) {
//     match.areautil = { $gte: req.query.areautil };
//   }
//   if (req.query.areabruta) {
//     match.areabruta = { $gte: req.query.areabruta };
//   }
//   if (req.query.anoconstrucao) {
//     match.anoconstrucao = { $gte: req.query.anoconstrucao };
//   }
//   if (req.query.estado) {
//     match.estado = req.query.estado;
//   }
//   if (req.query.casasdebanho) {
//     match.casasdebanho = req.query.casasdebanho;
//   }
//   if (req.query.quartos) {
//     match.quartos = req.query.quartos;
//   }
//   if (req.query.certicadoenergetico) {
//     match.certicadoenergetico = req.query.certicadoenergetico;
//   }

//   console.log("query: " + JSON.stringify(match));

//   const allPropriedades = await Propriedade.find(match).sort(sortquery);
//   return res.status(200).json(allPropriedades);
// });

// app.get("/pesquisa/arrendar", async (req, res) => {
//   console.log("triggered this");
//   const match = {};

//   match.tipodenegocio = "arrendar";

//   if (req.query.categoria) {
//     match.categoria = req.query.categoria;
//   }
//   if (req.query.distrito) {
//     match.Nomedistrito = req.query.distrito;
//   }
//   if (req.query.concelho) {
//     match.Nomeconcelho = req.query.concelho;
//   }

//   console.log("query: " + JSON.stringify(match));

//   const allPropriedades = await Propriedade.find(match);
//   return res.status(200).json(allPropriedades);
// });

// app.get("/propriedades/:id", async (req, res) => {
//   const { id } = req.params;
//   const propriedade = await Propriedade.findById(id);

//   //increment views.
//   await Propriedade.updateOne(
//     { _id: id },
//     { $inc: { visualizacoesAnuncio: 1 } }
//   );
//   return res.status(200).json(propriedade);
// });

// app.post("/propriedades", async (req, res) => {
//   const newPropriedade = new Propriedade({ ...req.body });
//   const insertedPropriedade = await newPropriedade.save();
//   console.log(req.body);

//   //increment distrito propriedades count.
//   if (req.body.distrito) {
//     await localizacao_distritos.updateOne(
//       { codigo_distrito: req.body.distrito },
//       { $inc: { propriedades: 1 } }
//     );
//   }

//   //increment concelho propriedades count.
//   if (req.body.concelho) {
//     await localizacao_concelhos.updateOne(
//       { codigo_concelho: req.body.concelho },
//       { $inc: { propriedades: 1 } }
//     );
//   }
//   //increment concelho propriedades count.
//   if (req.body.freguesia) {
//     await localizacao_freguesias.updateOne(
//       { codigo_freguesia: req.body.freguesia },
//       { $inc: { propriedades: 1 } }
//     );
//   }

//   return res.status(201).json(insertedPropriedade);
// });
// app.put("/propriedades/:id", async (req, res) => {
//   const { id } = req.params;
//   const filter = { _id: id };
//   await Propriedade.findOneAndUpdate(filter, req.body);

//   const updatedPropriedade = await Propriedade.findById(id);
//   return res.status(200).json(updatedPropriedade);
// });
// app.delete("/propriedades/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedPropriedade = await Propriedade.findByIdAndDelete(id);
//   return res.status(200).json(deletedPropriedade);
// });
// /* -- Custom Propriedades Endpoints -- */
// app.get("/propriedadesquerys/getpropriedadesbyviews", async (req, res) => {
//   const sort = { visualizacoesAnuncio: -1 };
//   const limit = 8;
//   const resultados = await Propriedade.find().sort(sort).limit(limit);
//   return res.status(200).json(resultados);
// });
// app.get("/propriedadesquerys/getpropriedadesbyuser/:id", async (req, res) => {
//   console.log("user propriesties triggered");
//   const { id } = req.params;
//   const resultados = await Propriedade.find({ idagente: id });
//   return res.status(200).json(resultados);
// });
// app.get("/propriedadesquerys/getdestaquespaginaprincipal", async (req, res) => {
//   const limit = 7;
//   const resultados = await Propriedade.find({
//     destaquepaginaprincipal: true,
//   }).limit(limit);
//   return res.status(200).json(resultados);
// });

// app.get(
//   "/propriedadesquerys/getpropriedadesbycategoria/:categoria",
//   async (req, res) => {
//     const { categoria } = req.params;
//     console.log("Slug triggered: " + categoria);
//     const resultados = await Propriedade.find({ categoria: categoria });
//     return res.status(200).json(resultados);
//   }
// );

// app.get(
//   "/propriedadesquerys/getpropriedadesbycategoria/:categoriaslug/:distrito",
//   async (req, res) => {
//     const { categoriaslug, distrito } = req.params;
//     console.log("Slug triggered: " + categoriaslug);
//     console.log("location triggered: " + distrito);
//     const resultados = await Propriedade.find({
//       categoria: categoriaslug,
//       Nomedistrito: distrito,
//     });
//     return res.status(200).json(resultados);
//   }
// );

// /* -- Endpoint Upload Assets Imagens --*/
// app.post("/uploadassets", async (req, res) => {
//   console.log("Triggered funcao backend upload para cloud.");
//   try {
//     const { images } = req.body;
//     const promises = [];
//     if (images) {
//       images.forEach(async (image) => {
//         promises.push(
//           cloudinary.uploader.upload(image, {
//             folder: "imagens-propriedades",
//           })
//         );
//       });
//     }
//     const response = await Promise.all(promises);
//     res.send(response);
//   } catch (error) {
//     console.log(error);
//   }
// });

// /** -- Endpoints de Agências --  */
// app.get("/agencias", async (req, res) => {
//   const allAgencias = await utilizadorAgencia.find();
//   return res.status(200).json(allAgencias);
// });
// app.get("/agencias/:id", async (req, res) => {
//   const { id } = req.params;
//   const agencia = await utilizadorAgencia.findById(id);
//   return res.status(200).json(agencia);
// });
// app.post("/agencias", async (req, res) => {
//   const newAgencia = new utilizadorAgencia({ ...req.body });
//   const insertedAgencia = await newAgencia.save();
//   return res.status(201).json(insertedAgencia);
// });
// app.put("/agencias/:id", async (req, res) => {
//   const { id } = req.params;
//   const filter = { _id: id };
//   await utilizadorAgencia.findOneAndUpdate(filter, req.body);

//   const updatedAgencia = await utilizadorAgencia.findById(id);
//   return res.status(200).json(updatedAgencia);
// });
// app.delete("/agencias/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedAgencia = await utilizadorAgencia.findByIdAndDelete(id);
//   return res.status(200).json(deletedAgencia);
// });

// /** -- Endpoints de Utilizador Normais --  */
// app.get("/utilizador", async (req, res) => {
//   const allUtilizadores = await utilizadorNormal.find();
//   return res.status(200).json(allUtilizadores);
// });
// app.get("/utilizador/:id", async (req, res) => {
//   const { id } = req.params;
//   const utilizador = await utilizadorNormal.findById(id);
//   return res.status(200).json(utilizador);
// });
// app.post("/utilizador", async (req, res) => {
//   const newUtilizador = new utilizadorNormal({ ...req.body });
//   const insertedUtilizador = await newUtilizador.save();
//   return res.status(201).json(insertedUtilizador);
// });
// app.put("/utilizador/:id", async (req, res) => {
//   const { id } = req.params;
//   const filter = { _id: id };
//   await utilizadorNormal.findOneAndUpdate(filter, req.body);
//   const updatedUtilizador = await utilizadorNormal.findById(id);
//   return res.status(200).json(updatedUtilizador);
// });
// app.delete("/utilizador/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedUtilizador = await utilizadorNormal.findByIdAndDelete(id);
//   return res.status(200).json(deletedUtilizador);
// });

// /** -- Endpoints de categorias --  */
// app.get("/categorias", async (req, res) => {
//   const allCategorias = await Categorias.find();
//   return res.status(200).json(allCategorias);
// });
// app.get("/categorias/:id", async (req, res) => {
//   const { id } = req.params;
//   const categoria = await Categorias.findById(id);
//   return res.status(200).json(categoria);
// });
// app.post("/categorias", async (req, res) => {
//   const newCategoria = new Categorias({ ...req.body });
//   const insertedCategoria = await newCategoria.save();
//   return res.status(201).json(insertedCategoria);
// });
// app.delete("/categorias/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedCategoria = await Categorias.findByIdAndDelete(id);
//   return res.status(200).json(deletedCategoria);
// });

// /** -- Endpoints de Comodidades --  */
// app.get("/comodidades", async (req, res) => {
//   const allComodidades = await Comodidades.find();
//   return res.status(200).json(allComodidades);
// });
// app.get("/comodidades/:id", async (req, res) => {
//   const { id } = req.params;
//   const comodidade = await Comodidades.findById(id);
//   return res.status(200).json(comodidade);
// });
// app.post("/comodidades", async (req, res) => {
//   const newComodidade = new Comodidades({ ...req.body });
//   const insertedComodidade = await newComodidade.save();
//   return res.status(201).json(insertedComodidade);
// });
// app.delete("/comodidades/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedCategoria = await Comodidades.findByIdAndDelete(id);
//   return res.status(200).json(deletedCategoria);
// });

// /** Endpoints de Newsletter */
// app.get("/newsletter", async (req, res) => {
//   const allNewsletter = await newsletterList.find();
//   return res.status(200).json(allNewsletter);
// });
// app.get("/newsletter/:id", async (req, res) => {
//   const { id } = req.params;
//   const newsletterID = await newsletterList.findById(id);
//   return res.status(200).json(newsletterID);
// });
// app.post("/newsletter", async (req, res) => {
//   const newsletterUser = new newsletterList({ ...req.body });
//   const insertedNewsletterUser = await newsletterUser.save();
//   return res.status(201).json(insertedNewsletterUser);
// });
// app.put("/newsletter/:id", async (req, res) => {
//   const { id } = req.params;
//   const filter = { _id: id };
//   await newsletterList.findOneAndUpdate(filter, req.body);

//   const updatedNewsletter = await newsletterList.findById(id);
//   return res.status(200).json(updatedNewsletter);
// });
// app.delete("/newsletter/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedNewsletter = await newsletterList.findByIdAndDelete(id);
//   return res.status(200).json(deletedNewsletter);
// });

// /** -- Endpoints de Blogs -- */
// app.get("/blogs", async (req, res) => {
//   const allBlogs = await Blog.find();
//   return res.status(200).json(allBlogs);
// });
// app.get("/blogs/:id", async (req, res) => {
//   const { id } = req.params;
//   const blogID = await Blog.findById(id);
//   return res.status(200).json(blogID);
// });
// app.post("/blogs", async (req, res) => {
//   const blogArticle = new Blog({ ...req.body });
//   const insertedBlogArticle = await blogArticle.save();
//   return res.status(201).json(insertedBlogArticle);
// });
// app.put("/blogs/:id", async (req, res) => {
//   const { id } = req.params;
//   const filter = { _id: id };
//   await Blog.findOneAndUpdate(filter, req.body);

//   const updatedBlog = await Blog.findById(id);
//   return res.status(200).json(updatedBlog);
// });
// app.delete("/blogs/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedBlog = await Blog.findByIdAndDelete(id);
//   return res.status(200).json(deletedBlog);
// });

// /* -- Custom Blog Endpoints -- */
// app.get("/blogsquerys/getblogsbyviews", async (req, res) => {
//   const sort = { visualizacoesAnuncio: -1 };
//   const limit = 4;
//   const resultados = await Blog.find().sort(sort).limit(limit);
//   return res.status(200).json(resultados);
// });

// /** -- Localizações --  */

app.get("/localizacoes/distritos", async (req, res) => {
  const sort = { nome_distrito: "asc" };
  const allDistrict = await localizacao_distritos.find().sort(sort);
  return res.status(200).json(allDistrict);
});

app.get("/localizacoes/distritos/maisanuncios", async (req, res) => {
  const sort = { propriedades: -1 };
  const allDistrict = await localizacao_distritos.find().sort(sort).limit(5);
  return res.status(200).json(allDistrict);
});


app.get("/localizacoes/concelhos", async (req, res) => {
  const sort = { nome_concelho: "asc" };
  const allConcelhos = await localizacao_concelhos.find().sort(sort);
  return res.status(200).json(allConcelhos);
});

app.get("/localizacoes/distritos/:slugdistrito", async (req, res) => {
  const { slugdistrito } = req.params;
  var query = { slug_distrito: slugdistrito };
  const distrito = await localizacao_distritos.find(query);
  return res.status(200).json(distrito);
});

app.get("/localizacoes/concelhos/:slugconcelho", async (req, res) => {
  const { slugconcelho } = req.params;
  var query = { slug_concelho: slugconcelho };
  const concelho = await localizacao_concelhos.find(query);
  return res.status(200).json(concelho);
});

app.get("/localizacoes/concelhos/porslug/:slugdistrito", async (req, res) => {
  console.log("new");
  const { slugdistrito } = req.params;

  //obter codigo distrito através do slug
  var query = { slug_distrito: slugdistrito };
  const localizacao_concelhosData = await localizacao_distritos.find(query);
  let codigodistrito = localizacao_concelhosData[0].codigo_distrito;

  //mapear concelhos que tenham codigo distrito
  var query = { codigo_distrito: codigodistrito };
  const concelhosdedistrito = await localizacao_concelhos.find(query);
  return res.status(200).json(concelhosdedistrito);
});

// app.get("/freguesias", async (req, res) => {
//   const sort = { nome_freguesia: "asc" };
//   const allfreguesias = await localizacao_freguesias.find().sort(sort);
//   return res.status(200).json(allfreguesias);
// });

// //Obter concelhos de um distrito através de codigo_distrito
// app.get("/distritos/:concelhoslug", async (req, res) => {
//   const { concelhoslug } = req.params;
//   var query = { codigo_distrito: concelhoslug };
//   const sort = { nome_concelho: "asc" };
//   const localizacao_concelhosData = await localizacao_concelhos
//     .find(query)
//     .sort(sort);
//   return res.status(200).json(localizacao_concelhosData);
// });

// //Obter freguesias de um concelho codigo_distrito
// app.get("/concelhos/:slugfreguesia", async (req, res) => {
//   const { slugfreguesia } = req.params;
//   var query = { codigo_concelho: slugfreguesia };
//   const sort = { nome_freguesia: "asc" };
//   const localizacao_concelhosData = await localizacao_freguesias
//     .find(query)
//     .sort(sort);
//   return res.status(200).json(localizacao_concelhosData);
// });

// //obter codigo distrito atrés de slug
// app.get("/distrito/codigodistrito/:slugdistrito", async (req, res) => {
//   const { slugdistrito } = req.params;
//   var query = { slug_distrito: slugdistrito };
//   const localizacao_concelhosData = await localizacao_distritos.find(query);

//   let codigodistrito = localizacao_concelhosData[0].codigo_distrito;
//   return res.status(200).json(codigodistrito);
// });

// //obter todos concelhos de um distrito.

// //obter todos as freguesias de um concelho.
// app.get("/freguesias/porslug/:slugconcelho", async (req, res) => {
//   console.log("new");
//   const { slugconcelho } = req.params;
//   console.log("new");

//   //obter codigo distrito através do slug
//   var query = { slug_concelho: slugconcelho };
//   const localizacao_concelhoData = await localizacao_concelhos.find(query);
//   console.log("test 1 -> received: " + localizacao_concelhoData);
//   let codigoconcelho = localizacao_concelhoData[0].codigo_concelho;

//   //mapear concelhos que tenham codigo distrito
//   var query = { codigo_concelho: codigoconcelho };
//   const freguesiasconcelho = await localizacao_freguesias.find(query);
//   return res.status(200).json(freguesiasconcelho);
// });

// //Obter distritos por mais propriedades anunciadas.
// app.get("/distritosquery/getdistritosbyviews", async (req, res) => {
//   const sort = { propriedades: -1 };
//   const limit = 4;

//   const allDistrict = await localizacao_distritos
//     .find()
//     .sort(sort)
//     .limit(limit);
//   return res.status(200).json(allDistrict);
// });

// //Obter concelhos por mais propriedades 7 co  imagem.
// app.get("/distritosquery/getdistritosbyviewsimagery", async (req, res) => {
//   const sort = { propriedades: -1 };
//   const limit = 7;

//   const allDistrict = await localizacao_concelhos
//     .find()
//     .sort(sort)
//     .limit(limit);
//   return res.status(200).json(allDistrict);
// });

// //temp return concelho ID
// app.get("/concelhos/:nomeconcelho", async (req, res) => {
//   const { nomeconcelho } = req.params;
//   var query = { nome_concelho: nomeconcelho };
//   const sort = { nome_concelho: "asc" };
//   const localizacao_concelhosData = await localizacao_concelhos
//     .find(query)
//     .sort(sort);
//   return res.status(200).json(localizacao_concelhosData);
// });

//app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);

  res.render("error");
});

module.exports = app;
