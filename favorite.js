const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
//處理圖片
const POSTER_URL = BASE_URL + '/posters/'
//直接取得存在local storage中的電影清單
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')

//將電影資料放入HTML
function renderMovieList(data) {
    let rawHTML = ''
    data.forEach((item) => {
        rawHTML += `
            <div class="col-sm-3">
                    <div class="mb-2">
                        <div class="card">
                            <img src="${POSTER_URL + item.image}"
                                class="card-img-top" alt="Movie Poster" />
                            <div class="card-body">
                                <h5 class="card-title">${item.title}</h5>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                                    data-target="#movie-modal" data-id="${item.id}">More</button>
                                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
                            </div>
                        </div>
                    </div>
                </div>
        `
    })
    dataPanel.innerHTML = rawHTML
}


//請求在more中要顯示的資料
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
  })
}
//將電影移除
function removeFromFavorite (id) {
    //如果清單是空的則不繼續執行下面的程式
    if(!movies) return
    //用Id找到要刪除的電影的位置，並存入movieIndex
    const movieIndex = movies.findIndex(movie => movie.id === id)
    //如果沒有找到符合的id則不繼續執行下面的程式
    if(movieIndex === -1) return
    //找到後刪除存放在movieIndex中的電影
    movies.splice(movieIndex,1)
    //將已經把電影刪除的movies陣列存回local storage
    localStorage.setItem('favoriteMovies', JSON.stringify(movies))
    //用已經刪除電影的movies陣列重新渲染畫面
    renderMovieList(movies)
}

//當點擊按鈕時觸發事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
    //使用showMovieModal帶入，使按鈕都對應到各自電影的資料
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    }else if (event.target.matches('.btn-remove-favorite')) {
        removeFromFavorite(Number(event.target.dataset.id))
    }
})


renderMovieList(movies)