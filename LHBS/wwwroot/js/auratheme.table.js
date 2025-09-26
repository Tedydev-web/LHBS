// self executing function
(function () {
    const loadTables = document.querySelectorAll('div[data-loadtable]');
    if (loadTables.length > 0) {
        loadTables.forEach(table => {
            if (table) {
                let searchInput = table.querySelector("input.searchtable[name='search']");
                if (searchInput) {
                    searchInput.addEventListener('keydown', function (event) {
                        if (event.key === 'Enter') {
                            table.setAttribute("data-table-search", searchInput.value);
                            refreshTable(table);
                        }
                    });
                }
                loadData(table.getAttribute("data-loadtable"), getTableActionsObject(table), table.id);
            }
        });
    }
})();

function attachLoadingToTable(renderDiv) {
    // Create the loading div element
    var loadingDiv = document.createElement('div');
    loadingDiv.className = 'position-absolute top-50 start-50 translate-middle text-center';

    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'spinner-border';
    spinnerDiv.setAttribute('role', 'status');

    var spanElement = document.createElement('span');
    spanElement.className = 'visually-hidden';
    spanElement.textContent = 'Loading...';

    spinnerDiv.appendChild(spanElement);
    loadingDiv.appendChild(spinnerDiv);

    let table = renderDiv.querySelector("table");
    table.parentNode.appendChild(loadingDiv);
}

function findParentWithAttribute(element, attributeName) {
    // Start from the current element
    let currentElement = element;

    // Traverse up the DOM hierarchy until we reach the root or find the attribute
    while (currentElement !== null) {
        // Check if the current element has the specified attribute
        if (currentElement.hasAttribute(attributeName)) {
            return currentElement; // Found the parent with the attribute
        }
        // Move up to the parent node
        currentElement = currentElement.parentNode;
    }

    // If no parent with the attribute is found, return null
    return null;
}

function sortTable(order, clickedcolumn) {
    let renderDiv = findParentWithAttribute(clickedcolumn, "data-loadtable");
    renderDiv.setAttribute("data-table-sort", order);
    attachLoadingToTable(renderDiv);
    refreshTable(renderDiv);
}

function searchTable(clickedButton) {
    let renderDiv = findParentWithAttribute(clickedButton, "data-loadtable");
    let searchInput = renderDiv.querySelector("input.searchtable[name='search']");
    renderDiv.setAttribute("data-table-search", searchInput.value);
    attachLoadingToTable(renderDiv);
    refreshTable(renderDiv);
}

function resetTable(clickedButton) {
    let renderDiv = findParentWithAttribute(clickedButton, "data-loadtable");
    emptyTableActionsObject(renderDiv);
    attachLoadingToTable(renderDiv);
    refreshTable(renderDiv);
    let searchinput = renderDiv.querySelector("input.searchtable[name='search']");
    if (searchinput != null) {
        searchinput.value = "";
    }
    //all Dropdown Within Search Filter Container
    const filterDropdowns = renderDiv.querySelectorAll('.dropdown');
    if (filterDropdowns != null) {
        filterDropdowns.forEach(dropdown => {
            //reset the search input in the drop down
            const searchInputs = dropdown.querySelector(`.dropdown-menu input`);
            if (searchInputs != null) {
                searchInputs.value = "";
            }
            //reset the <li> options
            var ul = dropdown.querySelector(`ul`);
            var siblings = Array.prototype.filter.call(ul.children, function (li) {
                return li;
            });
            for (var j = 0; j < siblings.length; j++) {
                siblings[j].style.display = 'block';
            }
            //remove the active class of the selected <li> option
            const activeitem = dropdown.querySelector(`.dropdown-item.active`);
            if (activeitem != null) {
                activeitem.classList.remove('active');
            }
            // Set the dropdown toggle text to the selected text
            const dropdownToggle = dropdown.querySelector(`.dropdown-toggle`);
            if (dropdownToggle != null) {
                const placeholdertext = dropdown.querySelector(`button`).getAttribute("placeholder");
                if (placeholdertext != null) {
                    dropdownToggle.textContent = placeholdertext;
                } else {
                    dropdownToggle.textContent = "Please Select";
                }
                const selectedDropdownItem = document.querySelector('.dropdown-item');
                if (selectedDropdownItem != null && selectedDropdownItem.innerText.trim() === 'Show 10 Records') {
                    selectedDropdownItem.classList.add('active');
                }
            }
            //set dropdown input value to ""
            const dropdownInputValue = dropdown.querySelector(`input.dropdown-input`);
            if (dropdownInputValue != null) {
                dropdownInputValue.value = "";
            }
        });
    }
}

function changePage(targetPage, clickedElement) {
    let renderDiv = findParentWithAttribute(clickedElement, "data-loadtable");
    renderDiv.setAttribute("data-table-pg", targetPage);
    refreshTable(renderDiv);
}

function onChangeTableLength(clickedItem) {
    let selected = clickedItem.getAttribute("data-value");
    let renderDiv = findParentWithAttribute(clickedItem, "data-loadtable");
    renderDiv.setAttribute("data-table-size", selected);
    attachLoadingToTable(renderDiv);
    refreshTable(renderDiv);

    // Find the closest parent <ul> of the clicked element
    var dropdownMenu = clickedItem.closest('ul');
    console.log(dropdownMenu);
    // Remove 'active' class from all <li> inside the same dropdown <ul>
    dropdownMenu.querySelectorAll('li').forEach(function (li) {
        let activeOption = li.querySelector('a');
        if (activeOption) {
            activeOption.classList.remove('active');
        }
    });

    // Add 'active' class to the clicked <a> element
    clickedItem.classList.add('active');

    // Update the dropdown button text with the clicked <a> text
    var dropdown = clickedItem.closest('.dropdown');
    var dropdownButton = dropdown.querySelector('button');
    dropdownButton.textContent = clickedItem.textContent;
}

function getTableActionsObject(renderDiv) {
    var attributes = renderDiv.attributes;
    var tableActionsObject = {};
    for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].name.indexOf('data-table') === 0) {
            var attributeName = attributes[i].name.replace('data-table-', '');
            tableActionsObject[attributeName] = attributes[i].value;
        }
    }
    return tableActionsObject;
}

function emptyTableActionsObject(renderDiv) {
    var attributes = renderDiv.attributes;
    for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].name.indexOf('data-table') === 0) {
            renderDiv.setAttribute(attributes[i].name, "");
        }
    }
}

function refreshTable(renderDiv) {
    loadData(renderDiv.getAttribute("data-loadtable"), getTableActionsObject(renderDiv), renderDiv.id);
}

function loadData(loadTableUrl, searchFilterParams, tableId) {
    fetch(loadTableUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchFilterParams)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.querySelector(`#${tableId} .toRenderTable`).innerHTML = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        })
        .finally(() => {
            //do something finally
        });
}

function openConfirmationModal(recordTitle, yesUrl, areYouSureHeading, information) {
    var myModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    myModal.show();
    var confirmDeleteButton = document.querySelector("#confirmed-deletebtn");
    var recordTitleWrapper = document.querySelector("#record-title");
    var heading = document.querySelector("#areyousure-heading");
    var informationWrapper = document.querySelector("#information");
    if (recordTitleWrapper) {
        let title = recordTitle.replace("&#39;", "\'");
        recordTitleWrapper.textContent = title.replace("&#34;", "\"");
    }
    if (heading) {
        heading.textContent = (areYouSureHeading == "" || areYouSureHeading == null) ? "Permanently delete this record?" : areYouSureHeading;
    }
    if (informationWrapper) {
        informationWrapper.textContent = (information == "" || information == null) ? "Deleting is permanent and can't be undone. Are you sure you to proceed?" : information;
    }
    if (confirmDeleteButton) {
        //If you want to change the text for the "Yes, Delete It" button, you can change it using the code below.
        //if (yesUrl.includes("closeticket")) {
        //    confirmDeleteButton.textContent = "Yes, Close Now";
        //}
        confirmDeleteButton.addEventListener('click', () => {
            window.location = yesUrl;
        });
    }
}

function getCurrentDateTimeForFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minutes}${seconds}`;
}

let tableNotFoundMessage = "The table is still loading. Please click on the button again after the table is fully loaded.";
function exportToExcel(tableId) {
    let renderTableDiv = document.getElementById(tableId);
    $(".dropdown-menu").remove();
    var table = renderTableDiv.querySelector("table");
    if (table != null) {
        /* Create worksheet from HTML DOM TABLE */
        var wb = XLSX.utils.table_to_book(table);

        /* Modify the workbook to exclude columns with specific class */
        var sheetName = wb.SheetNames[0]; // Assuming there's only one sheet
        var worksheet = wb.Sheets[sheetName];

        // Identify columns with the specified class
        var thCells = table.querySelectorAll("th.notexport");

        thCells.forEach(th => {
            var colIndex = th.cellIndex;
            var range = XLSX.utils.decode_range(worksheet['!ref']);
            for (var rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
                var cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colIndex });
                delete worksheet[cellAddress];
            }
        });

        /* Export to file (start a download) */
        XLSX.writeFile(wb, `${renderTableDiv.getAttribute("data-filename")}-${getCurrentDateTimeForFileName()}.xlsx`);
        window.location.href = window.location.href;
    } else {
        $("#notificationToast .toast-body").text(tableNotFoundMessage);
        $('#notificationToast-container').show();
        $("#notificationToast").addClass("show");
    }
}

function exportToCsv(tableId) {
    let renderTableDiv = document.getElementById(tableId);
    $(".dropdown-menu").remove();
    var table = renderTableDiv.querySelector("table");
    if (table != null) {
        /* Create worksheet from HTML DOM TABLE */
        var wb = XLSX.utils.table_to_book(table);

        /* Modify the workbook to exclude columns with specific class */
        var sheetName = wb.SheetNames[0]; // Assuming there's only one sheet
        var worksheet = wb.Sheets[sheetName];

        // Identify columns with the specified class
        var thCells = table.querySelectorAll("th.notexport");

        thCells.forEach(th => {
            var colIndex = th.cellIndex;
            var range = XLSX.utils.decode_range(worksheet['!ref']);
            for (var rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
                var cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colIndex });
                delete worksheet[cellAddress];
            }
        });

        /* Export to file (start a download) */
        XLSX.writeFile(wb, `${renderTableDiv.getAttribute("data-filename")}-${getCurrentDateTimeForFileName()}.csv`);
        window.location.href = window.location.href;
        return true;
    } else {
        $("#notificationToast .toast-body").text(tableNotFoundMessage);
        $('#notificationToast-container').show();
        $("#notificationToast").addClass("show");
        return false;
    }
}

function exportToPdf(tableId, isPortrait) {
    let renderTableDiv = document.getElementById(tableId);
    // Get the HTML table element
    var table = renderTableDiv.querySelector("table");
    if (table != null) {
        // Define the columns for the table
        var columns = [];
        var headers = table.querySelectorAll("th:not(.notexport)");

        headers.forEach(function (header) {
            // Ignore the action column when exporting to PDF
            if (header.innerText.trim() != "") {
                columns.push({ text: header.innerText, style: "tableHeader" });
            }
        });

        // Define the data for the table
        var data = [];
        var rows = table.querySelectorAll("tbody tr");
        rows.forEach(function (row) {
            // Skip rows with colspan, indicating "No Data Available"
            if (row.querySelector('td[colspan]')) {
                return;
            }

            var rowData = [];
            var cells = row.querySelectorAll("td:not(.notexport)");
            cells.forEach(function (cell) {
                if (!cell.innerHTML.includes("actioncol")) {
                    rowData.push(cell.innerText.trim());
                }
            });
            data.push(rowData);
        });

        var colWidth = [];
        columns.forEach(function (col) {
            colWidth.push("auto");
        });

        // Define the pdfmake table definition
        var tableDefinition = {
            headerRows: 1,
            widths: colWidth, // Set the column widths
            body: [columns].concat(data), // Add the column headers to the beginning of the data array
            style: "tableStyle", // Apply a custom style to the table
        };

        // Define the pdfmake document definition
        var docDefinition = {
            pageOrientation: isPortrait == true || isPortrait == "True" || isPortrait == "true" ? 'portrait' : 'landscape',
            content: [
                {
                    table: tableDefinition, // Add the table definition to the pdfmake document definition
                },
            ],
            styles: {
                tableHeader: {
                    bold: true,
                    fontSize: 12,
                    color: "black",
                    alignment: "center",
                },
                tableStyle: {
                    margin: [0, 5, 0, 15],
                    fontSize: 9,
                },
            },
        };

        // Create the pdf document and download it
        pdfMake.createPdf(docDefinition).download(`${renderTableDiv.getAttribute("data-filename")}-${getCurrentDateTimeForFileName()}.pdf`);
    } else {
        $("#notificationToast .toast-body").text(tableNotFoundMessage);
        $('#notificationToast-container').show();
        $("#notificationToast").addClass("show");
    }
}

function exportToDocx(elementId, isTable) {
    let element = document.getElementById(elementId);
    let content = element.textContent;
    if (isTable) {
        content = element.querySelector("tbody").textContent;
    }
    // Remove empty lines and trim leading/trailing spaces from each line
    const paragraphs = content
        .split('\n')
        .map(line => line.trim()) // Trim each line
        .filter(line => line !== '') // Remove empty lines
        .map(trimmedLine => new docx.Paragraph({
            children: [new docx.TextRun({
                text: trimmedLine,
                size: 24 // 24 is 12 in docx file
            })]
        }));
    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: paragraphs
            }
        ]
    });
    docx.Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `${element.getAttribute("data-filename")}-${getCurrentDateTimeForFileName()}.docx`);
    });
    return true;
}

function exportToTxt(eleId, isTable) {
    let element = document.getElementById(eleId);
    let content = element.textContent;
    // Only export the tbody content
    if (isTable) {
        content = element.querySelector("tbody").textContent;
    }
    // Remove empty lines and trim leading/trailing spaces from each line
    content = content
        .split('\n')
        .map(line => line.trim()) // Trim leading and trailing spaces
        .filter(line => line !== '') // Remove empty lines
        .join('\n');
    let blob = new Blob([content], { type: 'text/plain' });
    let fileName = `${document.getElementById(eleId).getAttribute("data-filename")}-${getCurrentDateTimeForFileName()}.txt`;
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, fileName);
    } else {
        let link = document.createElement('a');
        if (link.download !== undefined) {
            let url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
}