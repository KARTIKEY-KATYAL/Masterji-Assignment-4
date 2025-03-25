let currentPage = 1;
let isLoading = false;
let allBooks = []; // Store all fetched books

async function getBooks(pageno) {
  if (isLoading) return;
  isLoading = true;

  const options = {
    method: "GET",
    url: "https://api.freeapi.app/api/v1/public/books",
    params: {
      page: pageno,
      limit: "20",
      inc: "kind%2Cid%2Cetag%2CvolumeInfo",
      query: null,
    },
    headers: { accept: "application/json" },
  };

  try {
    const { data } = await axios.request(options);
    if (!data.data) {
      isLoading = false;
      return null;
    }
    const books = Array(data.data.data)[0];
    allBooks = books; // Store books for filtering/sorting
    displayBooks(books);

    currentPage = pageno;
    updatePaginationButtons();
    isLoading = false;
  } catch (error) {
    console.error(error);
    isLoading = false;
  }
}

function displayBooks(books) {
  const bookcontainer = document.querySelector(".booksstore");
  bookcontainer.innerHTML = "";

  if (books.length === 0) {
    bookcontainer.innerHTML = "<p class='no-results'>No books found</p>";
    return;
  }

  books.forEach((book) => {
    const bookdiv = document.createElement("div");

    const title = book.volumeInfo.title;
    const author = book.volumeInfo.authors;
    const publisher = book.volumeInfo.publisher;
    const publishedDate = book.volumeInfo.publishedDate;
    const thumbnail = book.volumeInfo.imageLinks?.thumbnail;
    const infoLink = book.volumeInfo.infoLink;

    bookdiv.innerHTML = `
    <div class="card" ">
    <img src="${thumbnail}" alt="book thumbnail" onclick="window.open('${infoLink}', '_blank')"/>
                <div class="book-details">
                <h2>${title}</h2>
                    <p>Author: ${author}</p>
                    <p>Publisher: ${publisher}</p>
                    <p>Published Date: ${publishedDate}</p>
                </div>
                </div>
        `;
    bookcontainer.appendChild(bookdiv);
  });
}

function updatePaginationButtons() {
  const prevBtn = document.getElementById("prevbtn");
  const nextBtn = document.getElementById("nextbtn");

  // Disable previous button on first page
  prevBtn.disabled = currentPage === 1;
  prevBtn.style.opacity = currentPage === 1 ? "0.5" : "1";

  // Add event listeners for pagination buttons
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      getBooks(currentPage - 1);
    }
  };

  nextBtn.onclick = () => {
    getBooks(currentPage + 1);
  };
}

function filterBooks() {
  const bookname = document.getElementById("booknameinput").value;
  const filteredBooks = allBooks.filter((book) =>
    book.volumeInfo.title.toLowerCase().includes(bookname.toLowerCase())
  );
  displayBooks(filteredBooks);
}

function sortbyname() {
  const sortedBooks = allBooks.sort((a, b) =>
    a.volumeInfo.title.localeCompare(b.volumeInfo.title)
  );
  displayBooks(sortedBooks);
}

function sortbydate() {
  const sortedBooks = allBooks.sort(
    (a, b) =>
      new Date(a.volumeInfo.publishedDate) -
      new Date(b.volumeInfo.publishedDate)
  );
  displayBooks(sortedBooks);
}

function toogleview() {
  const bookcontainer = document.querySelector(".booksstore");
  const toggleButton = document.getElementById("toggleview");

  // Toggle the list-view class
  bookcontainer.classList.toggle("list-view");

  // Update button text based on current view
  const isListView = bookcontainer.classList.contains("list-view");
  toggleButton.textContent = isListView
    ? "Switch to Grid View"
    : "Switch to List View";

  // Store the user's preference
  localStorage.setItem("preferredView", isListView ? "list" : "grid");
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  
  getBooks(currentPage);

  // Add search and sort listeners
  document
    .getElementById("booknameinput")
    .addEventListener("input", filterBooks);

  document.getElementById("sorta2z").addEventListener("click", sortbyname);

  document.getElementById("sortdate").addEventListener("click", sortbydate);

  document.getElementById("toggleview").addEventListener("click", toogleview);

  // Restore user's preferred view
  const preferredView = localStorage.getItem("preferredView");
  if (preferredView === "list") {
    document.querySelector(".booksstore").classList.add("list-view");
    document.getElementById("toggleview").textContent = "Switch to Grid View";
  }
});
