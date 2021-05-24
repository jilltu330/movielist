const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
//預設值
let mode = 'card'
let page = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewSelection = document.querySelector('#view-selection')


function renderMovieView() {
  if (mode === 'list') {
    renderMovieByList(getMoviesByPage(page))
  } else if (mode === 'card') {
    renderMovieByCard(getMoviesByPage(page))
  }
}

function renderMovieByList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
    <div class="col-sm-12 border-top">
        <div class="list d-flex justify-content-between align-items-center">
          <div class="card-body">
            <h5 class="card-title pt-2">${item.title}</h5>
          </div>

          <div class="list-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
              data-id="${item.id}">
              More
            </button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderMovieByCard(data) {
  //裝解析ＤＡＴＡ後所產生的ＨＴＭＬ
  let rawHTML = ''
  //render movie data
  data.forEach(item => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  //最後將rawHTML資料夾入到dataPanel裡面
  dataPanel.innerHTML = rawHTML
}

//顯示分頁器頁數的函式
function renderPaginator(amount) {
  //電影總筆數除以每頁筆數，用math.ceil無條件進位
  const NumberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= NumberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    paginator.innerHTML = rawHTML
  }
}

//分頁函式：將電影資料以每頁12筆顯示, 
function getMoviesByPage(page) {
  //修改資料來源，加入三元運算子。條件：如果filter movie長度>0 回傳filtermovie的值，否則回傳movies的值
  const data = filteredMovies.length ? filteredMovies : movies
  //切割陣列的一部分，然後回傳回來
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date :' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt = "movie-poster" class="image-fluid" > `
  })
}

function addToFavorite(id) {
  //JSON.parse()：取出時，將 JSON 格式的字串轉回 JavaScript 原生物件
  //list是收藏清單
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  //JSON.stringify() ：存入時，將資料轉為 JSON 格式的字串
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

viewSelection.addEventListener('click', function onIconClicked(event) {
  if (event.target.matches('#list-view')) {
    mode = 'list'
  } else if (event.target.matches('#card-view')) {
    mode = 'card'
  }
  renderMovieView()
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//分頁的監聽器，點擊分頁頁數會顯示該頁數內的電影
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //設定條件檢查點擊的元素, 如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //檢查點擊時是否為點擊的頁數
  //console.log(event.target.dataset.page)

  //顯示正確頁數的電影
  page = Number(event.target.dataset.page)
  renderMovieView()
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`Cannot find movie with keyword: ${keyword}`)
  }

  //重新製作分頁器
  renderPaginator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  page = 1
  renderMovieView()

})

axios.get(INDEX_URL).then((response) => {
  //...展開運算子 Spread Operator 展開陣列元素
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  //當載入資料顯示第一頁
  renderMovieView()
})
  .catch((err) => console.log(err))

