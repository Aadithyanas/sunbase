const sampleData = [
    {
        "id": "c0ac49c5-871e-4c72-a878-251de465e6b4",
        "type": "input",
        "label": "Sample Input",
        "placeholder": "Sample placeholder"
    },
    {
        "id": "146e69c2-1630-4a27-9d0b-f09e463a66e4",
        "type": "select",
        "label": "Sample Select",
        "options": ["Sample Option", "Sample Option", "Sample Option"]
    },
    {
        "id": "45002ecf-85cf-4852-bc46-529f94a758f5",
        "type": "textarea",
        "label": "Sample Textarea",
        "placeholder": "Sample Placeholder"
    },
    {
        "id": "680cff8d-c7f9-40be-8767-e3d6ba420952",
        "type": "checkbox",
        "label": "Sample Checkbox"
    }
];

let formData = [...sampleData];
let selectedElement = null;
let draggedElement = null;
let draggedIndex = null;

const formContainer = document.getElementById('form-container');
const editorPanel = document.getElementById('editor-panel');
const saveBtn = document.getElementById('save-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const previewBtn = document.getElementById('preview-btn');
const previewContainer = document.getElementById('preview-container');
const previewForm = document.getElementById('preview-form');
const htmlCode = document.getElementById('html-code');
const copyHtmlBtn = document.getElementById('copy-html-btn');
const closePreviewBtn = document.getElementById('close-preview-btn');


const popupEditor = document.createElement('div');
popupEditor.className = 'popup-editor';
popupEditor.innerHTML = `
    <div class="popup-content">
        <div class="popup-header">
            <h3>Edit Element</h3>
            <button class="close-popup-btn">&times;</button>
        </div>
        <div class="popup-body" id="popup-form"></div>
        <div class="popup-footer">
            <button class="save-popup-btn">Save Changes</button>
        </div>
    </div>
`;
document.body.appendChild(popupEditor);


const popupForm = document.getElementById('popup-form');
const closePopupBtn = document.querySelector('.close-popup-btn');
const savePopupBtn = document.querySelector('.save-popup-btn');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function renderForm() {
    formContainer.innerHTML = '';
    formData.forEach((element, index) => {
        const formElement = document.createElement('div');
        formElement.className = 'form-element';
        formElement.dataset.id = element.id;
        formElement.dataset.type = element.type;
        formElement.draggable = true;
        
        formElement.addEventListener('dragstart', handleDragStart);
        formElement.addEventListener('dragover', handleDragOver);
        formElement.addEventListener('drop', handleDrop);
        formElement.addEventListener('dragend', handleDragEnd);
        
        let content = '';
        switch(element.type) {
            case 'input':
                content = `
                    <div class="form-element-actions">
                        <span class="drag-handle">☰</span>
                        <button class="action-btn" data-action="edit">✏️</button>
                        <button class="action-btn" data-action="delete">🗑️</button>
                    </div>
                    <label for="${element.id}">${element.label}</label>
                    <input type="text" id="${element.id}" placeholder="${element.placeholder || ''}">
                `;
                break;
            case 'select':
                let options = '';
                element.options.forEach(option => {
                    options += `<option value="${option}">${option}</option>`;
                });
                content = `
                    <div class="form-element-actions">
                        <span class="drag-handle">☰</span>
                        <button class="action-btn" data-action="edit">✏️</button>
                        <button class="action-btn" data-action="delete">🗑️</button>
                    </div>
                    <label for="${element.id}">${element.label}</label>
                    <select id="${element.id}">
                        ${options}
                    </select>
                `;
                break;
            case 'textarea':
                content = `
                    <div class="form-element-actions">
                        <span class="drag-handle">☰</span>
                        <button class="action-btn" data-action="edit">✏️</button>
                        <button class="action-btn" data-action="delete">🗑️</button>
                    </div>
                    <label for="${element.id}">${element.label}</label>
                    <textarea id="${element.id}" placeholder="${element.placeholder || ''}"></textarea>
                `;
                break;
            case 'checkbox':
                content = `
                    <div class="form-element-actions">
                        <span class="drag-handle">☰</span>
                        <button class="action-btn" data-action="edit">✏️</button>
                        <button class="action-btn" data-action="delete">🗑️</button>
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="${element.id}">
                        <label for="${element.id}">${element.label}</label>
                    </div>
                `;
                break;
        }
        
        formElement.innerHTML = content;
        
        
        const editBtn = formElement.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openPopupEditor(element.id);
            });
        }
        
        const deleteBtn = formElement.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteElement(element.id);
            });
        }
        
        formContainer.appendChild(formElement);
    });
}

function addElement(type) {
    const newElement = {
        id: generateUUID(),
        type: type,
        label: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)}`
    };

    if (type === 'input' || type === 'textarea') {
        newElement.placeholder = 'Sample placeholder';
    } else if (type === 'select') {
        newElement.options = ['Sample Option'];
    }
    
    formData.push(newElement);
    renderForm();
    openPopupEditor(newElement.id);
}

function deleteElement(id) {
    formData = formData.filter(element => element.id !== id);
    
    if (selectedElement && selectedElement.id === id) {
        closePopupEditor();
        selectedElement = null;
    }
    
    renderForm();
}


function openPopupEditor(id) {
    
    selectedElement = formData.find(element => element.id === id);
    
    if (selectedElement) {
        renderPopupEditor();
        popupEditor.classList.add('active');
        
       
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        document.body.appendChild(overlay);
        
        
        const element = document.querySelector(`.form-element[data-id="${id}"]`);
        if (element) {
            element.classList.add('selected');
        }
    }
}


function closePopupEditor() {
    popupEditor.classList.remove('active');
    
    
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
    
    
    const selectedElements = document.querySelectorAll('.form-element.selected');
    selectedElements.forEach(el => el.classList.remove('selected'));
    
    selectedElement = null;
}


function renderPopupEditor() {
    if (!selectedElement) return;
    
    let formHTML = '';
    
    formHTML += `
        <div class="editor-field">
            <label for="edit-label">Label</label>
            <input type="text" id="edit-label" value="${selectedElement.label || ''}">
        </div>
    `;
    

    switch(selectedElement.type) {
        case 'input':
        case 'textarea':
            formHTML += `
                <div class="editor-field">
                    <label for="edit-placeholder">Placeholder</label>
                    <input type="text" id="edit-placeholder" value="${selectedElement.placeholder || ''}">
                </div>
            `;
            break;
        case 'select':
            formHTML += `
                <div class="editor-field">
                    <label>Options</label>
                    <div class="options-container" id="options-container">
                        ${selectedElement.options.map((option, index) => `
                            <div class="option-item">
                                <input type="text" class="option-input" data-index="${index}" value="${option}">
                                <button class="action-btn" data-action="delete-option" data-index="${index}">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                    <button id="add-option-btn" class="add-option-btn">Add Option</button>
                </div>
            `;
            break;
    }
    
    popupForm.innerHTML = formHTML;
    

    if (selectedElement.type === 'select') {
        const addOptionBtn = document.getElementById('add-option-btn');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', () => {
                selectedElement.options.push('New Option');
                renderPopupEditor();
            });
        }
        
        const deleteOptionBtns = document.querySelectorAll('[data-action="delete-option"]');
        deleteOptionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                selectedElement.options.splice(index, 1);
                renderPopupEditor();
            });
        });
    }
}


function savePopupChanges() {
    if (!selectedElement) return;
    
    
    const labelInput = document.getElementById('edit-label');
    if (labelInput) {
        selectedElement.label = labelInput.value;
    }
    
    
    const placeholderInput = document.getElementById('edit-placeholder');
    if (placeholderInput) {
        selectedElement.placeholder = placeholderInput.value;
    }
    
   
    if (selectedElement.type === 'select') {
        const optionInputs = document.querySelectorAll('.option-input');
        selectedElement.options = [];
        optionInputs.forEach(input => {
            selectedElement.options.push(input.value);
        });
    }
    
    renderForm();
    closePopupEditor();
}

function handleDragStart(e) {
    draggedElement = e.target;
    draggedIndex = Array.from(formContainer.children).indexOf(draggedElement);
    setTimeout(() => {
        draggedElement.classList.add('dragging');
    }, 0);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest('.form-element');
    if (!dropTarget || dropTarget === draggedElement) return false;
    
    const dropIndex = Array.from(formContainer.children).indexOf(dropTarget);
    
    
    const [movedItem] = formData.splice(draggedIndex, 1);
    formData.splice(dropIndex, 0, movedItem);
    
    renderForm();
    
    return false;
}

function handleDragEnd() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
        draggedIndex = null;
    }
}


function saveForm() {
    console.log('Form data saved:', JSON.stringify(formData, null, 2));
    alert('Form saved! Check the console for JSON data.');
}


function showPreview() {
    previewForm.innerHTML = '';
    let htmlOutput = '<form>';
    
    formData.forEach(element => {
        let elementHTML = '';
        switch(element.type) {
            case 'input':
                elementHTML = `
                    <div class="form-group">
                        <label for="${element.id}">${element.label}</label>
                        <input type="text" id="${element.id}" placeholder="${element.placeholder || ''}">
                    </div>
                `;
                break;
            case 'select':
                let options = '';
                element.options.forEach(option => {
                    options += `<option value="${option}">${option}</option>`;
                });
                elementHTML = `
                    <div class="form-group">
                        <label for="${element.id}">${element.label}</label>
                        <select id="${element.id}">
                            ${options}
                        </select>
                    </div>
                `;
                break;
            case 'textarea':
                elementHTML = `
                    <div class="form-group">
                        <label for="${element.id}">${element.label}</label>
                        <textarea id="${element.id}" placeholder="${element.placeholder || ''}"></textarea>
                    </div>
                `;
                break;
            case 'checkbox':
                elementHTML = `
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="${element.id}">
                        <label for="${element.id}">${element.label}</label>
                    </div>
                `;
                break;
        }
        
        htmlOutput += elementHTML;
        previewForm.innerHTML += elementHTML;
    });
    
    htmlOutput += '</form>';
    htmlCode.textContent = htmlOutput;
    
    previewContainer.style.display = 'flex';
}


function copyHTML() {
    const htmlToCopy = htmlCode.textContent;
    navigator.clipboard.writeText(htmlToCopy)
        .then(() => {
            alert('HTML copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy HTML. Please try again.');
        });
}


function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('mobile-hidden');
}


document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.parentElement.dataset.type;
        addElement(type);
    });
});


closePopupBtn.addEventListener('click', closePopupEditor);
savePopupBtn.addEventListener('click', savePopupChanges);


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup-overlay')) {
        closePopupEditor();
    }
});

saveBtn.addEventListener('click', saveForm);
darkModeToggle.addEventListener('click', toggleDarkMode);
previewBtn.addEventListener('click', showPreview);
copyHtmlBtn.addEventListener('click', copyHTML);
closePreviewBtn.addEventListener('click', () => {
    previewContainer.style.display = 'none';
});


const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
}

renderForm();