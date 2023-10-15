const WPAPI = "https://thehelpfultipper.com/wp-json/wp/v2/posts?per_page=20";

// Utils
const createElm = (elm) => document.createElement(elm);

// Fetch THT blog posts
const fetchPosts = async () => {
  const resp = await fetch(WPAPI);
  const posts = await resp.json();

  // custom data
  const customPosts = posts.map((post) => {
    return {
      link: post.link,
      img: post.yoast_head_json.og_image[0].url,
      title: post.title.rendered,
      desc: post.excerpt.rendered
    };
  });
  // console.log(customPosts);
  return customPosts;
};

// Build post card
// @post -- single blog post, extract:
// { @link, @yoast_head_json: og_image[]: url, @title: rendered, @excerpt:rendered } for display
const singlePostCard = (post) => {
  const cardWrapper = createElm("div");
  const cardOverlay = createElm("div");
  const postContent = createElm("div");
  const postLink = createElm("a");
  const featImg = createElm("img");
  const title = createElm("h3");
  const desc = createElm("p");

  cardWrapper.classList.add("card_wrapper");
  cardOverlay.classList.add("card_overlay");
  postContent.classList.add("post_content");
  postLink.href = post.link;
  postLink.alt = "";
  postLink.target = "_blank";
  postLink.rel = "noopener";
  featImg.src = post.img;
  title.innerText = post.title;
  desc.innerHTML = post.desc;

  postLink.appendChild(cardOverlay);
  [title, desc].forEach((item) => postContent.appendChild(item));
  [featImg, postLink, postContent].forEach((item) =>
    cardWrapper.appendChild(item)
  );
  document.querySelector(".container").appendChild(cardWrapper);
};

// Add cards to document
const addPostCardsToDoc = async () => {
  const posts = await fetchPosts();

  let itemsPerPage =
      window.innerWidth > 648 && window.innerWidth < 1078 ? 4 : 3,
    totalItems = posts.length,
    totalPages = Math.ceil(totalItems / itemsPerPage),
    currentPage = 1;

  // PAGINATION ---------
  const Pagination = {
    code: "",

    Extend: function (data) {
      data = data || {};

      Pagination.size = data.size || 30;
      Pagination.page = data.page || 1;
      Pagination.step = data.step || 3;
      Pagination.items = data.items || 3;
      Pagination.posts = posts;
    },

    Add: function (s, f) {
      for (var i = s; i < f; i++) {
        Pagination.code += '<button class="page_num">' + i + "</button>";
      }
    },

    Last: function () {
      Pagination.code +=
        '<i>...</i><button class="page_num">' + Pagination.size + "</button>";
    },

    First: function () {
      Pagination.code += '<button class="page_num">1</button><i>...</i>';
    },

    DisplayPage: function (pN) {
      const container = document.querySelector(".container");
      container.innerHTML = "";

      const startIndex = (pN - 1) * Pagination.items;
      const endIndex = startIndex + Pagination.items;

      if (Pagination.posts) {
        for (
          let i = startIndex;
          i < endIndex && i < Pagination.posts.length;
          i++
        ) {
          Pagination.posts &&
            Pagination.posts.forEach(
              (post, index) => index === i && singlePostCard(post)
            );
        }
      }
    },

    Click: function () {
      Pagination.page = +this.innerHTML;
      Pagination.DisplayPage(Pagination.page);
      Pagination.Start();
    },

    Prev: function () {
      Pagination.page--;
      if (Pagination.page < 1) {
        Pagination.page = Pagination.size;
      }
      Pagination.Start();
    },

    Next: function () {
      Pagination.page++;

      if (Pagination.page > Pagination.size) {
        Pagination.page = 1;
      }
      Pagination.Start();
    },

    TypePage: function () {
      Pagination.code =
        '<input class="input_num" onclick="this.setSelectionRange(0, this.value.length);this.focus();" onkeypress="if (event.keyCode == 13) { this.blur(); }" value="' +
        Pagination.page +
        '" /> &nbsp; / &nbsp; ' +
        Pagination.size;
      Pagination.Finish();

      var v = Pagination.e.getElementsByTagName("input")[0];
      v.click();

      v.addEventListener(
        "blur",
        function (event) {
          var p = parseInt(this.value);

          if (!isNaN(parseFloat(p)) && isFinite(p)) {
            if (p > Pagination.size) {
              p = Pagination.size;
            } else if (p < 1) {
              p = 1;
            }
          } else {
            p = Pagination.page;
          }

          Pagination.Init(document.querySelector(".pagination"), {
            size: Pagination.size,
            page: p,
            step: Pagination.step,
            items: Pagination.items,
            posts: Pagination.posts
          });

          Pagination.DisplayPage(p);
        },
        false
      );
    },

    Bind: function () {
      var btn = Pagination.e.getElementsByTagName("button");
      for (var i = 0; i < btn.length; i++) {
        if (+btn[i].innerHTML === Pagination.page)
          btn[i].className += " active";
        btn[i].addEventListener("click", Pagination.Click, false);
      }

      var d = Pagination.e.getElementsByTagName("i");
      for (i = 0; i < d.length; i++) {
        d[i].addEventListener("click", Pagination.TypePage, false);
      }
    },

    Finish: function () {
      Pagination.e.innerHTML = Pagination.code;
      Pagination.code = "";
      Pagination.Bind();
    },

    Start: function () {
      Pagination.step = 3;

      if (Pagination.size < Pagination.step) {
        Pagination.Add(1, Pagination.size + 1);
      } else if (Pagination.page <= Pagination.step) {
        Pagination.Add(1, Pagination.step + 1);
        Pagination.Last();
      } else if (Pagination.page > Pagination.size - Pagination.step) {
        Pagination.First();
        Pagination.Add(
          Pagination.size + 1 - Pagination.step,
          Pagination.size + 1
        );
      } else {
        Pagination.First();
        Pagination.Add(
          Pagination.page - Pagination.step + 1,
          Pagination.page + Pagination.step
        );
        Pagination.Last();
      }
      Pagination.Finish();
    },

    Buttons: function (e) {
      var nav = e.querySelectorAll(".navBtn");
      nav[0].addEventListener("click", Pagination.Prev, false);
      nav[1].addEventListener("click", Pagination.Next, false);
    },

    Create: function (e) {
      var html = [
        '<button class="navBtn">Prev</button>', // previous button
        "<span></span>", // pagination container
        '<button class="navBtn">Next</button>' // next button
      ];
      e.innerHTML = html.join("");
      Pagination.e = e.getElementsByTagName("span")[0];
      Pagination.Buttons(e);
    },

    Init: function (e, data) {
      Pagination.Extend(data);
      Pagination.Create(e);
      Pagination.Start();

      // Initialize first page display
      Pagination.DisplayPage(1);
    }
  };

  Pagination.Init(document.querySelector(".pagination"), {
    size: totalPages, // pages size
    page: currentPage, // selected page
    step: 3, // pages before and after current
    items: itemsPerPage, // items to show per page
    posts // fetched posts
  });
};

// Show posts
document.addEventListener("DOMContentLoaded", addPostCardsToDoc, false);
