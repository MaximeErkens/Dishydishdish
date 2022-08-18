const app = require("./app");

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

const userRouter = require("./routes/user.routes");
app.use("/user", userRouter);

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
