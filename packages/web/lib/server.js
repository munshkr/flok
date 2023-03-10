import { createServer } from "http";
import { parse } from "url";
import next from "next";
import connect from "connect";
import withFlokServer from "@flok/server";

export default function startServer({ hostname, port, isDevelopment }) {
  // when using middleware `hostname` and `port` must be provided below
  const nextApp = next({ dev: isDevelopment, hostname, port });
  const handle = nextApp.getRequestHandler();

  console.log("> Preparing app...");
  nextApp.prepare().then(() => {
    const app = withFlokServer(connect());

    app.use(async (req, res) => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    createServer(app)
      .once("error", (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  });
}



