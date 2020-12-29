const request = require("supertest");
    const app = require("../server.js");

    describe("GET /", () => {
      it("respond with Hello World", (done) => {
        request(app).get("/").expect("Hello World", done);
      })
    });
    
    describe("GET /email_list", () => {
      it("respond with Email list", (done) => {
        request(app).get("/email_list").expect("Here is the email list : ", done);
      })
    });
    