const data = [
    { firstName: "Rizwan", lastName: "Ahmad", marks: 85 },
    { firstName: "Israr", lastName: "Iqbal", marks: 70 },
    { firstName: "Jaweria", lastName: "Kamran", marks: 60 },
    { firstName: "Ariba", lastName: "Mustaq", marks: 30 },
    { firstName: "Hammad", lastName: "Rubani", marks: 25 },
    { firstName: "Ali", lastName: "Raza", marks: 90 },
    { firstName: "Yusra", lastName: "Javeed", marks: 75 },
    { firstName: "talha", lastName: "razaq", marks: 31 },
    { firstName: "Abdul", lastName: "Sami", marks: 40 },
    { firstName: "Asad", lastName: "Saddique", marks: 88 },
    { firstName: "Ahmad", lastName: "Raza", marks: 15 },
];

const transformedData = data.map((std) => {
    const fullName = `${std.firstName.charAt(0).toUpperCase() + std.firstName.slice(1)} ${std.lastName.charAt(0).toUpperCase() + std.lastName.slice(1)}`;
    const status = std.marks >= 33 ? "Pass" : "Fail";
    const marks =std.marks
    return { fullName, status, marks };
});

const studentsContainer = document.querySelector(".students");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const itemsCount = document.querySelector(".items");

const itemsPerPage = 5; 
let currentPage = 1;
const totalPages = Math.ceil(transformedData.length / itemsPerPage);

function displayPage(page) {
    
    studentsContainer.innerHTML= "";

    currentPage = page;

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const itemsToShow = transformedData.slice(startIdx, endIdx);

    itemsToShow.forEach(item => {
        const studentRow = document.createElement("tr");
        const statusClass = item.status === "Pass" ? "status-pass" : "status-fail";
        studentRow.innerHTML = `
            <td>${item.fullName}</td>
            <td>${item.marks}</td>
            <td class="${statusClass}">${item.status}</td>`;
        studentsContainer.appendChild(studentRow);
    });

    updateUI(startIdx, endIdx);
}

function updateUI(start, end) {
    const endCount = Math.min(end, transformedData.length);
    itemsCount.innerHTML = `<h2>Showing ${start + 1}-${endCount} out of ${transformedData.length}</h2>`;

    prevBtn.style.display = currentPage <= 1 ? "none" : "block";
    nextBtn.style.display = currentPage >= totalPages ? "none" : "block";
}

nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
        displayPage(currentPage + 1);
    }
});

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        displayPage(currentPage - 1);
    }
});

displayPage(1);