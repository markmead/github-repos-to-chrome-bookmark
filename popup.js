function GithubBookmark() {
  this.login = '';
  this.name = ''
  this.image = '';
  this.nameEl = document.getElementById('name');
  this.imageEl = document.getElementById('image');
  this.textEl = document.getElementById('text');
  this.keyEl = document.getElementById('key');
};

GithubBookmark.prototype.findUser = function() {
  const searchButton = document.getElementById('search');
  const createButton = document.getElementById('button');

  createButton.disabled = true

  searchButton.addEventListener('click', () => {
    fetch(`https://api.github.com/users/${this.textEl.value}`)
      .then(response => response.json())
      .then(data => {
        this.login = data.login
        this.image = data.avatar_url
        this.name = data.name
        
        this.nameEl.innerText = this.name
        this.imageEl.src = this.image

        createButton.disabled = false
      })
      .catch(err => alert(err))
  })
};

GithubBookmark.prototype.createBookmarks = function() {
  let queryPage = 1
  const createButton = document.getElementById('button');
  const pageInput = document.getElementById('page');

  pageInput.addEventListener('input', () => queryPage = event.currentTarget.value)

  createButton.addEventListener('click', () => {
    let queryUrl
    const accessKey = this.keyEl.value

    if (accessKey) {
      queryUrl = `https://api.github.com/user/repos?access_token=${accessKey}&per_page=100&page=${queryPage}`
    } else {
      queryUrl = `https://api.github.com/users/${this.login}/repos?&per_page=100&page=${queryPage}`
    }

    fetch(queryUrl)
      .then(response => response.json())
      .then(data => {
        chrome.bookmarks.create({ 
          'parentId': '1', 
          'title': `${this.name} ${data.length} GitHub Repos (Page: ${queryPage})` 
        }, function(currentFolder) {
          for(let item of data) {
            chrome.bookmarks.create({ 
              'parentId': currentFolder.id, 
              'title':  item.name,
              'url': item.html_url
            })
          }
        });
      })
      .catch(err => alert(err))
  });
};


GithubBookmark.prototype.init = function() {
  this.findUser()
  this.createBookmarks()
};

document.addEventListener('DOMContentLoaded', () => {
  const githubBookmark = new GithubBookmark()
  githubBookmark.init()
});