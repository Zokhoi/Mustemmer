!(async () => {
  let got = (await import("got")).default;
  let base = "http://localhost:3456/";
  let res;
  let sess_id = "";

  res = await got.post(base + "login", {
    form: {
      username: "test",
      password: "test",
    },
  });
  console.log(res.body);
  if (JSON.parse(res.body).status !== "ok") return;

  sess_id = res.headers["set-cookie"][0].split("; ")[0] + "; ";

  res = await got
    .post(base + "update", {
      headers: {
        Cookie: sess_id,
      },
      json: {
        data: [
          // {
          //   id: 1,
          //   personnel: [{ name: "Santana", role: ["guitarist"] }, { name: "Rob Thomas", role: ["vocalist"] }],
          //   name: "Smooth",
          //   key: ["11B"],
          //   tempo: [116],
          // },
          // {
          //   id: 2,
          //   personnel: [{ name: "inabakumori", role: ["producer", "lyrics"] }],
          //   name: "Lagtrain",
          //   key: ["9A"],
          //   tempo: [147],
          // },
          // {
          //   id: 24,
          //   time: ["6/8"],
          //   key: ["9A", "9B"],
          // },
          // {
          //   id: 25,
          //   time: ["6/8"],
          //   key: ["5A", "5B"],
          // },
        ],
      },
    })
    .json();
  console.log(JSON.stringify(res, null, 2));
  if (res.status !== "ok") return;
  // await new Promise((res)=>setTimeout(res, 1500))
  res = await got
    .post(base + "search", {
      form: {
        // name: "%fre%"
        // id: 24
      },
    })
    .json();
  console.log(JSON.stringify(res, null, 2));
})();
