var app = require("./app");
const start = async () => {
  try {
    app.listen(80, () => console.log("Server started on port 80"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
