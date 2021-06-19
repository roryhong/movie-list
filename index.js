const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
//處理圖片
const POSTER_URL = BASE_URL + '/posters/'
//裝所有電影
const movies = []
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
                                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>
        `
    })
    dataPanel.innerHTML = rawHTML
}


//取得電影的資料
axios.get(INDEX_URL).then(response => {
    //將電影清單放在movies陣列中變成[{1,2,3}]，但並不想要變成[[{1,2,3}]]，所以用以下的方式
    //第一種 : for-of迴圈將資料一個一個push進movies
    // for(const movie of response.data.results) {
    //     movies.push(movie)
    // }
    //第二種 : 使用展開運算子展開陣列元素
    movies.push(...response.data.results)
    //將電影總數帶入renderPaginator，動態產生頁數
    //為何要在axios中呼叫而不能在外面呼叫?不是已經有movies的資料了嗎?
    //ans:有兩種情況movies的內容會改變，導致頁數也跟著改變，分別是(1)從後端API拿到資料時(2)關鍵字搜尋時
    //此處是因為第一種狀況而改變，而在外呼叫的話如果movies改變了就無法拿到原始的movies中的資料，故在一開始取得
    renderPaginator(movies.length)
    //預設顯示第一頁的資訊
    renderMovieList(getMoviesByPage(1))
}).catch(error => console.log(err))

//用id得到不同電影的資訊，點擊more後會出現這些資訊
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

//將點擊的電影放入local storage
function addToFavorite (id) {
    //取得在local storage中favoriteMovies中的value，並從JSON格式的字串轉回JS原生物件
    //第一次收藏時會回傳空陣列(取得的value會是null)，等到第二次收藏時就可以取得value
    // ||(or) : 有一邊是true則會回傳true，如果兩邊都是true則會回傳左邊的
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    //測試
    // console.log(list)
    // console.log(localStorage.getItem('favoriteMovies'))

    //尋找movies陣列中符合條件的item
    //find() :在陣列中尋找符合條件的item，但找到第一個item就停止尋找並回傳item
    const movie = movies.find((movie) => movie.id === id)
    //比對欲加入清單的id，是否在list中已經存在
    //some() :比對陣列中是否有通過條件的item，有的話回傳true
    if(list.some((movie) => movie.id === id)) {
        return alert('此電影已經在收藏清單中')
    }
    list.push(movie)
    //在local storage中加入favoriteMovie這個key，value則是轉換成JSON格式(字串)的list清單
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//當點擊按鈕時觸發事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
    //使按鈕都對應到各自電影的資訊
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    //將被點擊的電影加入收藏清單
    }else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
})


//監聽表單提交事件
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
//裝收藏的電影
let filteredMovies = []
searchForm.addEventListener('submit', function onSearchFormSubmitted (event) {
    //表單的submit事件會有預設行為，所以要終止瀏覽器的預設行為，將控制權交給js
    event.preventDefault()
    //trim():將字串前後的空格去除
    //toLowerCase():將所有的英文字母變成小寫
    const keyword = searchInput.value.trim().toLowerCase()
    //當input沒有輸入內容時跳出提示框
    // if(!keyword.length) {
    //     return alert('請輸入有效字串')
    // }
    
    //要將有包含keyword的電影名稱放進陣列filteredMovies中
    //做法一:用for of迴圈
    // for(const movie of movies) {
    //     if(movie.title.toLowerCase().includes(keyword)) {
    //         filteredMovies.push(movie)
    //     }
    // }

    //作法二:用filter篩選條件符合的項目，並將符合的項目存在filteredMovies陣列中
    //includes():比對是否包含欲尋找的字串，會區分大小寫
    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    )

    //當filteredMovies陣列中中沒有任何項目與keyword相同
    if(filteredMovies.length === 0) {
        return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }
    //依照收藏的電影數量(filteredMovies陣列中的內容數)動態產生頁數
    renderPaginator(filteredMovies.length)
    //依照getMoviesByPage的結果，來決定顯示所有電影或是顯示關鍵字搜尋的結果，預設是顯示第一頁
    renderMovieList(getMoviesByPage(1))
})


//讓每個分頁一次最多出現12個電影，包含全部顯示時跟關鍵字搜尋時
const MOVIES_PER_PAGE = 12
function getMoviesByPage(page) {
    //如果filteredMovies陣列中有東西(亦即收藏清單中有電影)，則回傳filteredMovies
    //如果filteredMovies陣列中沒有東西則回傳movies(即顯示所有電影)
    //條件(三元)運算子 : 條件? 值1 : 值2，條件為true則回傳值1，false則回傳值2
    const data = filteredMovies.length ? filteredMovies : movies
    //計算電影的起始index
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    //切割data陣列，並回傳切割後的新陣列
    //slice(start,end):設定範圍切割陣列，但不包含最後一個(end)
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//依照電影數量產生多少分頁
const paginator = document.querySelector('#paginator')
function renderPaginator(amount) {
    //將電影總數除以每頁12筆電影，並使用Math.ceil()方法將小數點無條件進位
    const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
    let rawHTML = ''
    //產生頁數
    for(let page = 1; page <= numberOfPage; page++) {
        rawHTML += `
            <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
        `
    }
    paginator.innerHTML = rawHTML
}

//在頁碼設置監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
    //如果點擊的不是a標籤則不繼續執行下面的程式
    //tagName: 返回標籤名稱，要比對的標籤需使用大寫字母
    if(event.target.tagName !== 'A') return
    //取得被點擊的頁碼
    const page = Number(event.target.dataset.page)
    //計算在點擊的頁碼中應該顯示的電影，並重新渲染網頁
    renderMovieList(getMoviesByPage(page))
})

