const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_BY_PAGE = 24
const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []
let page = 1
let filteredUsers = []


const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 宣告函式：印出user清單
function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
          <div class="card m-2" style="width: 10rem">
            <!-- User Avatar trigger modal -->
            <img src=${item.avatar} class="card-img-top"
              alt="User Avatar" >
            <div class="card-body">
              <p class="card-text">${item.name} ${item.surname}
              </p>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-primary btn-sm btn-show-more-info"data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">more</button>
              <button type="button" class="btn btn-danger btn-sm btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
      `
  })

  dataPanel.innerHTML = rawHTML
}

// 宣告函式：印出分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_BY_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


// 宣告函式：依照頁碼取出對應的user資料
function getUserByPage(page) {
  //三元運算子：若filteredUsers.length為true則回傳filteredUsers，否則回傳users
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_BY_PAGE
  const endIndex = startIndex + USERS_BY_PAGE
  return data.slice(startIndex, endIndex)
}


// 宣告函式：顯示詳細資料
function showUserModal(id) {
  //取出 modal裡需要置換資料的元素
  const modalTitle = document.querySelector('#user-modal-title')
  const modalImage = document.querySelector('#user-modal-image')
  const modalInfo = document.querySelector('#user-modal-info')

  // 將modal先清空，避免一開始出現前一筆資料的殘影
  modalTitle.textContent = ''
  modalImage.src = ''
  modalInfo.innerHTML = ''

  // 串接 Show API請求資料
  axios.get(INDEX_URL + id)
    .then((res) => {
      // 將取得的資料置入modal元素
      // 將資料重複的部分宣告為常數以簡化
      const theData = res.data
      modalTitle.textContent = theData.name + ' ' + theData.surname
      modalImage.src = theData.avatar
      modalInfo.innerHTML = `
        <p>email: ${theData.email}</p>
        <p>gender: ${theData.gender}</p>
        <p>age: ${theData.age}</p>
        <p>region: ${theData.region}</p>
        <p>birthday: ${theData.birthday}</p>`
    })
    .catch((err) => console.log(err))
}

// // 宣告函式：刪除收藏用戶
function removeFavorite(id) {
  // 若users陣列不存在or雖存在但為空陣列，則結束函式
  if (!users || !users.length) return
  // 比對按鈕id＆每筆清單個別資料的id
  const userIndex = users.findIndex(user => user.id === id)
  //若沒有符合id的用戶(此時.findIndex會回傳-1)，則結束函式
  if (userIndex === -1) return
  //刪除該筆用戶
  users.splice(userIndex, 1)
  //存回 local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  // 更新頁面
  renderUserList(users)
  renderPaginator(users.length)
}


// 設置監聽器:
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 若點到 more 按鈕則調用showUserModal函式，傳入綁在按鈕上的id參數
  if (event.target.matches('.btn-show-more-info')) {
    showUserModal(event.target.dataset.id)
  }
  // 若點到 x 按鈕則調用removeFavorite函式，傳入綁在按鈕上的id參數
  else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})


// 設置監聽器:分頁器
paginator.addEventListener('click', function onClickPaginator(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.innerText)
  renderUserList(getUserByPage(page))
  // }
})


// 入口
renderPaginator(users.length)
renderUserList(getUserByPage(1))