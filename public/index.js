
//function to open add recipe form
function addRecipeForm() {
    window.location.href = "/addRecipe";
}

//function to open home page
function homepg() {
    window.location.href = "/home";
}

// function to open recipe page
function recipepg(recipeId) {
    window.location.href = `/recipe/${recipeId}`;
}

//for showing steps and ingredients
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".recipeImg").forEach(img => {
        img.addEventListener("click", async function () {
            const recipeId = this.dataset.id;

            try {
                const response = await fetch(`/recipe/${recipeId}`);
                const data = await response.json();

                if (data) {
                    document.getElementById("recipeTitle").innerText = data.name;

                    const ingredientsList = document.getElementById("ingredientsList");
                    ingredientsList.innerHTML = "";
                    data.ingredients.split(",").forEach(ingredient => {
                        let li = document.createElement("li");
                        li.innerText = ingredient.trim();
                        ingredientsList.appendChild(li);
                    });

                    const stepsList = document.getElementById("stepsList");
                    stepsList.innerHTML = "";
                    data.steps.split(".").forEach(step => {
                        let li = document.createElement("li");
                        li.innerText = step.trim();
                        stepsList.appendChild(li);
                    });

                    document.getElementById("recipeDetails").style.display = "block";
                }
            } catch (error) {
                console.error("Error fetching recipe details:", error);
            }
        });
    });
});

// animation for landing page text
window.addEventListener("scroll", () => {

    const pageText = document.getElementById("landing_pg");
    const scrollPosition = window.scrollY;
    // console.log(scrollPosition);

    if (scrollPosition > 0 && scrollPosition <= 20) {
        pageText.classList.add("zoomedOut0");
        pageText.classList.remove("zoomedOut1", "zoomedOut2", "zoomedOut3", "zoomedOut4");
    } else if (scrollPosition > 20 && scrollPosition <= 40) {
        pageText.classList.add("zoomedOut1");
        pageText.classList.remove("zoomedOut2", "zoomedOut3", "zoomedOut4");
    } else if (scrollPosition > 40 && scrollPosition <= 60) {
        pageText.classList.add("zoomedOut2");
        pageText.classList.remove("zoomedOut3", "zoomedOut4");
    } else if (scrollPosition > 60 && scrollPosition <= 80) {
        pageText.classList.add("zoomedOut3");
        pageText.classList.remove("zoomedOut4");
    } else if (scrollPosition > 80 && scrollPosition <= 400) {
        pageText.classList.add("zoomedOut4");
    }
    else {
        pageText.classList.add("zoomedOut5");
    }

})

// search bar placeholders
const placeholderArray = ["Enter Recipe Name...", "Happy cooking time", "Search yummmmm!"];
const searchBar = document.querySelector("#searchInput");
let textIndex = 0;
let charIndex = 0;
if (searchBar.placeholder.trim() === "") {
    searchBar.placeholder = "What you want?";
}
function typePlaceholder() {
    if (textIndex === placeholderArray.length) textIndex = 0;

    let currentText = placeholderArray[textIndex];
    let typing = setInterval(() => {
        if (charIndex <= currentText.length) {
            searchInput.placeholder = currentText.substring(0, charIndex);
            charIndex++;
        } else {
            clearInterval(typing);
            charIndex = 0;
            textIndex++;
            setTimeout(typePlaceholder, 5000);
        }
    }, 100);
}
setTimeout(() => {
    typePlaceholder();
}, 5000);