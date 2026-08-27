// ==========================================
// GAMEFINDER
// JavaScript
// ==========================================


// ==========================================
// INICIALIZAÇÃO
// ==========================================

async function initializeApplication() {

    try {

        // ======================================
        // JOGOS POPULARES
        // ======================================

        showLoading(
            popularLoading
        );


        const rawgPopular =
            await getPopularGames();


        games =
            adaptGames(rawgPopular);

        cacheGames(games);
        
        renderGames(
            games.slice(0, 4),
            popularGamesGrid
        );


        hideLoading(
            popularLoading
        );


        // ======================================
        // LANÇAMENTOS
        // ======================================

        await loadNewestGames();


        // ======================================
        // MAIS BEM AVALIADOS
        // ======================================

        await loadTopRatedGames();


        // ======================================
        // FAVORITOS
        // ======================================

        loadFavorites();


        console.log(
            "GameHub inicializado:",
            games
        );

    } catch (error) {

        console.error(
            "Erro ao inicializar o GameHub:",
            error
        );

    }

}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApplication();

    }
);


// ==========================================
// DADOS DOS JOGOS
// ==========================================

let games = [];

let gameCache = [];

function cacheGames(gamesList) {

    if (!gamesList || gamesList.length === 0) {
        return;
    }


    gamesList.forEach(
        (game) => {

            const existingGame =
                gameCache.find(
                    cachedGame =>
                        cachedGame.id === game.id
                );


            if (!existingGame) {

                gameCache.push(game);

            }

        }
    );

}

// ==========================================
// ELEMENTOS DO DOM
// ==========================================

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

const searchMessage =
    document.getElementById("searchMessage");

const searchResultsSection =
    document.getElementById(
        "searchResultsSection"
    );

const searchResultsGrid =
    document.getElementById(
        "searchResultsGrid"
    );

const searchResultsTitle =
    document.getElementById(
        "searchResultsTitle"
    );

const resultsCount =
    document.getElementById(
        "resultsCount"
    );

const searchEmptyState =
    document.getElementById(
        "searchEmptyState"
    );


const popularGamesGrid =
    document.getElementById(
        "popularGamesGrid"
    );

const newGamesGrid =
    document.getElementById(
        "newGamesGrid"
    );

const topRatedGamesGrid =
    document.getElementById(
        "topRatedGamesGrid"
    );


const favoritesGrid =
    document.getElementById(
        "favoritesGrid"
    );

const favoritesEmptyState =
    document.getElementById(
        "favoritesEmptyState"
    );


const platformFilter =
    document.getElementById(
        "platformFilter"
    );

const genreFilter =
    document.getElementById(
        "genreFilter"
    );

const sortFilter =
    document.getElementById(
        "sortFilter"
    );


const gameModal =
    document.getElementById(
        "gameModal"
    );

const modalOverlay =
    document.getElementById(
        "modalOverlay"
    );

const modalClose =
    document.getElementById(
        "modalClose"
    );

const modalGameImage =
    document.getElementById(
        "modalGameImage"
    );

const modalGameName =
    document.getElementById(
        "modalGameName"
    );

const modalGameGenre =
    document.getElementById(
        "modalGameGenre"
    );

const modalGameRating =
    document.getElementById(
        "modalGameRating"
    );

const modalGameRelease =
    document.getElementById(
        "modalGameRelease"
    );

const modalGamePlatforms =
    document.getElementById(
        "modalGamePlatforms"
    );

const modalGameDescription =
    document.getElementById(
        "modalGameDescription"
    );

const modalGameDeveloper =
    document.getElementById(
        "modalGameDeveloper"
    );

const officialSiteButton =
    document.getElementById(
        "officialSiteButton"
    );

const favoriteModalButton =
    document.getElementById(
        "favoriteModalButton"
    );


const toast =
    document.getElementById(
        "toast"
    );

const toastMessage =
    document.getElementById(
        "toastMessage"
    );


const popularLoading =
    document.getElementById(
        "popularLoading"
    );

const newGamesLoading =
    document.getElementById(
        "newGamesLoading"
    );

const topRatedLoading =
    document.getElementById(
        "topRatedLoading"
    );


const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );


// ==========================================
// VARIÁVEIS
// ==========================================

let currentGameId = null;

let favorites =
    JSON.parse(
        localStorage.getItem(
            "gamefinder-favorites"
        )
    ) || [];


// ==========================================
// CRIAR CARD
// ==========================================

function createGameCard(game) {

    const isFavorite =
        favorites.includes(game.id);


    const card =
        document.createElement("article");


    card.className =
        "game-card";


    card.dataset.id =
        game.id;


    const genres =
        game.genres
            .slice(0, 2)
            .join(" • ");


    const releaseDate =
        formatDate(game.releaseDate);


    card.innerHTML = `

        <div class="game-card-image">

            <img
                src="${game.image}"
                alt="Capa de ${game.name}"
                loading="lazy"
                onerror="this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22450%22 viewBox=%220 0 800 450%22%3E%3Crect width=%22800%22 height=%22450%22 fill=%22%23151a26%22/%3E%3Ctext x=%22400%22 y=%22225%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23ffffff%22 font-family=%22Arial%22 font-size=%2228%22%3EImagem indisponível%3C/text%3E%3C/svg%3E';"
            >

            <span class="game-rating">
                ⭐ ${game.rating}
            </span>


            <button
                class="favorite-button
                ${isFavorite ? "active" : ""}"
                data-id="${game.id}"
                type="button"
                aria-label="Adicionar ${game.name} aos favoritos"
            >
                ${isFavorite ? "❤️" : "🤍"}
            </button>

        </div>


        <div class="game-card-content">

            <h3 class="game-card-title">
                ${game.name}
            </h3>


            <div class="game-card-meta">

                <span>
                    📅 ${releaseDate}
                </span>

            </div>


            <div class="game-card-genres">
                ${genres}
            </div>


            <button
                class="game-details-button"
                data-id="${game.id}"
                type="button"
            >
                Ver detalhes
            </button>

        </div>

    `;


    return card;

}


// ==========================================
// RENDERIZAR JOGOS
// ==========================================

function renderGames(
    gamesList,
    container
) {

    container.innerHTML = "";


    if (
        !gamesList ||
        gamesList.length === 0
    ) {

        return;

    }


    gamesList.forEach(
        (game) => {

            const card =
                createGameCard(game);

            container.appendChild(card);

        }
    );

}


// ==========================================
// LANÇAMENTOS
// ==========================================

async function loadNewestGames() {

    showLoading(
        newGamesLoading
    );


    const rawgGames =
        await getNewestGames();


    const newestGames =
        adaptGames(rawgGames);

    cacheGames(newestGames);

    renderGames(
        newestGames.slice(0, 4),
        newGamesGrid
    );


    hideLoading(
        newGamesLoading
    );

}


// ==========================================
// MAIS BEM AVALIADOS
// ==========================================

async function loadTopRatedGames() {

    showLoading(
        topRatedLoading
    );


    const rawgGames =
        await getTopRatedGames();


    const topGames =
        adaptGames(rawgGames);

    cacheGames(topGames);

    renderGames(
        topGames.slice(0, 4),
        topRatedGamesGrid
    );


    hideLoading(
        topRatedLoading
    );

}


// ==========================================
// CARREGAR FAVORITOS
// ==========================================

function loadFavorites() {

    const favoriteGames =
        gameCache.filter(
            (game) =>
                favorites.includes(
                    game.id
                )
        );


    renderGames(
        favoriteGames,
        favoritesGrid
    );


    if (
        favoriteGames.length === 0
    ) {

        favoritesEmptyState.style.display =
            "block";

    } else {

        favoritesEmptyState.style.display =
            "none";

    }

}

// ==========================================
// SALVAR FAVORITOS
// ==========================================

function saveFavorites() {

    localStorage.setItem(
        "gamefinder-favorites",
        JSON.stringify(favorites)
    );

}


// ==========================================
// PESQUISA NA API RAWG
// ==========================================

searchForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const query =
            searchInput.value.trim();


        // --------------------------------------
        // VERIFICAR PESQUISA VAZIA
        // --------------------------------------

        if (!query) {

            showSearchMessage(
                "Digite o nome de um jogo."
            );

            return;

        }


        // --------------------------------------
        // LIMPAR MENSAGEM
        // --------------------------------------

        showSearchMessage(
            "🔎 Procurando jogos..."
        );


        // --------------------------------------
        // MOSTRAR RESULTADOS
        // --------------------------------------

        searchResultsSection
            .classList
            .add("visible");


        searchResultsTitle.textContent =
            `Resultados para "${query}"`;


        resultsCount.textContent =
            "Carregando...";


        searchEmptyState.style.display =
            "none";


        searchResultsGrid.innerHTML = `
            
            <div class="loading">

                <div class="spinner"></div>

                <p>
                    Buscando jogos...
                </p>

            </div>

        `;


        // --------------------------------------
        // BUSCAR NA RAWG
        // --------------------------------------

        const rawgResults =
            await searchGames(query);


        // --------------------------------------
        // ADAPTAR RESULTADOS
        // --------------------------------------

        const results =
            adaptGames(rawgResults);

        cacheGames(results);

        // --------------------------------------
        // MOSTRAR RESULTADOS
        // --------------------------------------

        displaySearchResults(
            results,
            query
        );


        showSearchMessage("");

    }
);

function displaySearchResults(
    results,
    query
) {

    searchResultsSection
        .classList
        .add("visible");


    searchResultsTitle.textContent =
        `Resultados para "${query}"`;


    resultsCount.textContent =
        `${results.length} ${
            results.length === 1
                ? "jogo"
                : "jogos"
        }`;


    renderGames(
        results,
        searchResultsGrid
    );


    if (results.length === 0) {

        searchEmptyState.style.display =
            "block";

    } else {

        searchEmptyState.style.display =
            "none";

    }


    searchResultsSection
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


// ==========================================
// MENSAGEM DE PESQUISA
// ==========================================

function showSearchMessage(
    message
) {

    searchMessage.textContent =
        message;

}


// ==========================================
// FILTROS
// ==========================================

platformFilter.addEventListener(
    "change",
    applyFilters
);

genreFilter.addEventListener(
    "change",
    applyFilters
);

sortFilter.addEventListener(
    "change",
    applyFilters
);


function applyFilters() {

    let filteredGames =
        [...games];


    const platform =
        platformFilter.value;

    const genre =
        genreFilter.value;

    const sort =
        sortFilter.value;


    // --------------------------------------
    // PLATAFORMA
    // --------------------------------------

    if (platform !== "all") {

        const platformMap = {

            pc: "PC",

            playstation:
                "PlayStation",

            xbox:
                "Xbox",

            nintendo:
                "Nintendo Switch"

        };


        const selectedPlatform =
            platformMap[platform];


        filteredGames =
            filteredGames.filter(
                (game) =>
                    game.platforms
                        .includes(
                            selectedPlatform
                        )
            );

    }


    // --------------------------------------
    // GÊNERO
    // --------------------------------------

    if (genre !== "all") {

        const genreMap = {

            action: "Ação",

            adventure:
                "Aventura",

            rpg:
                "RPG",

            strategy:
                "Estratégia",

            sports:
                "Esportes",

            racing:
                "Corrida"

        };


        const selectedGenre =
            genreMap[genre];


        filteredGames =
            filteredGames.filter(
                (game) =>
                    game.genres
                        .includes(
                            selectedGenre
                        )
            );

    }


    // --------------------------------------
    // ORDENAÇÃO
    // --------------------------------------

    switch (sort) {

        case "rating":

            filteredGames.sort(
                (a, b) =>
                    b.rating - a.rating
            );

            break;


        case "newest":

            filteredGames.sort(
                (a, b) =>
                    new Date(b.releaseDate) -
                    new Date(a.releaseDate)
            );

            break;


        case "oldest":

            filteredGames.sort(
                (a, b) =>
                    new Date(a.releaseDate) -
                    new Date(b.releaseDate)
            );

            break;


        case "popular":

        default:

            filteredGames.sort(
                (a, b) =>
                    b.rating - a.rating
            );

            break;

    }


    displaySearchResults(
        filteredGames,
        "filtros"
    );

}


// ==========================================
// EVENTOS DOS CARDS
// ==========================================
//
// Como os cards são criados dinamicamente,
// usamos delegação de eventos.
//

document.addEventListener(
    "click",
    (event) => {


        // ----------------------------------
        // FAVORITO
        // ----------------------------------

        const favoriteButton =
            event.target.closest(
                ".favorite-button"
            );


        if (favoriteButton) {

            event.stopPropagation();


            const gameId =
                Number(
                    favoriteButton.dataset.id
                );


            toggleFavorite(gameId);

            return;

        }


        // ----------------------------------
        // DETALHES
        // ----------------------------------

        const detailsButton =
            event.target.closest(
                ".game-details-button"
            );


        if (detailsButton) {

            const gameId =
                Number(
                    detailsButton.dataset.id
                );


            openGameModal(gameId);

        }

    }
);


// ==========================================
// FAVORITOS
// ==========================================

function toggleFavorite(
    gameId
) {

    const index =
        favorites.indexOf(gameId);


    if (index === -1) {

        favorites.push(gameId);

        showToast(
            "❤️ Jogo adicionado aos favoritos!"
        );

    } else {

        favorites.splice(
            index,
            1
        );

        showToast(
            "Jogo removido dos favoritos."
        );

    }


    saveFavorites();

    refreshFavoriteButtons();

    loadFavorites();

}


// ==========================================
// ATUALIZAR BOTÕES
// ==========================================

function refreshFavoriteButtons() {

    const buttons =
        document.querySelectorAll(
            ".favorite-button"
        );


    buttons.forEach(
        (button) => {

            const id =
                Number(
                    button.dataset.id
                );


            const isFavorite =
                favorites.includes(id);


            button.classList.toggle(
                "active",
                isFavorite
            );


            button.textContent =
                isFavorite
                    ? "❤️"
                    : "🤍";

        }
    );

}


// ==========================================
// ABRIR MODAL DE DETALHES
// ==========================================

async function openGameModal(gameId) {

    // --------------------------------------
    // DEFINIR JOGO ATUAL
    // --------------------------------------

    currentGameId = gameId;


    // --------------------------------------
    // ABRIR MODAL
    // --------------------------------------

    gameModal.classList.add(
        "active"
    );

    gameModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    // --------------------------------------
    // ESTADO DE CARREGAMENTO
    // --------------------------------------

    modalGameImage.src = "";

    modalGameImage.alt = "";

    modalGameName.textContent =
        "Carregando...";

    modalGameGenre.textContent =
        "CARREGANDO";

    modalGameRating.textContent =
        "⭐ --";

    modalGameRelease.textContent =
        "📅 --";

    modalGamePlatforms.innerHTML =
        "";

    modalGameDescription.textContent =
        "Buscando informações do jogo...";

    modalGameDeveloper.textContent =
        "Carregando...";

    officialSiteButton.href =
        "#";


    // --------------------------------------
    // BUSCAR DADOS COMPLETOS NA RAWG
    // --------------------------------------

    const game =
        await getGameDetails(
            gameId
        );


    // --------------------------------------
    // VERIFICAR ERRO
    // --------------------------------------

    if (!game) {

        modalGameName.textContent =
            "Não foi possível carregar";

        modalGameDescription.textContent =
            "Ocorreu um erro ao buscar as informações deste jogo.";

        modalGameDeveloper.textContent =
            "Não informado";

        return;

    }

    const adaptedGame =
    adaptGame(game);

    cacheGames([adaptedGame]);


    // --------------------------------------
    // IMAGEM
    // --------------------------------------

    modalGameImage.src =
        game.background_image ||
        "";

    modalGameImage.alt =
        `Capa de ${game.name}`;


    // --------------------------------------
    // NOME
    // --------------------------------------

    modalGameName.textContent =
        game.name ||
        "Nome não informado";


    // --------------------------------------
    // GÊNEROS
    // --------------------------------------

    modalGameGenre.textContent =
        game.genres &&
        game.genres.length > 0

            ? game.genres
                .map(
                    genre =>
                        genre.name
                )
                .join(" • ")

            : "Gênero não informado";


    // --------------------------------------
    // NOTA
    // --------------------------------------

    modalGameRating.textContent =
        `⭐ ${
            game.rating ??
            "N/A"
        }`;


    // --------------------------------------
    // DATA
    // --------------------------------------

    modalGameRelease.textContent =
        `📅 ${
            formatDate(
                game.released
            )
        }`;


    // --------------------------------------
    // PLATAFORMAS
    // --------------------------------------

    modalGamePlatforms.innerHTML =
        "";


    if (
        game.platforms &&
        game.platforms.length > 0
    ) {

        game.platforms.forEach(
            (platformData) => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "platform-tag";


                tag.textContent =
                    platformData.platform.name;


                modalGamePlatforms
                    .appendChild(tag);

            }
        );

    } else {

        modalGamePlatforms.innerHTML = `
            
            <span class="platform-tag">
                Não informado
            </span>

        `;

    }


    // --------------------------------------
    // DESCRIÇÃO
    // --------------------------------------

    modalGameDescription.textContent =
        game.description_raw ||
        "Descrição não disponível.";


    // --------------------------------------
    // DESENVOLVEDORA
    // --------------------------------------

    if (
        game.developers &&
        game.developers.length > 0
    ) {

        modalGameDeveloper.textContent =
            game.developers
                .map(
                    developer =>
                        developer.name
                )
                .join(", ");

    } else {

        modalGameDeveloper.textContent =
            "Não informado";

    }


    // --------------------------------------
    // SITE OFICIAL
    // --------------------------------------

    if (game.website) {

        officialSiteButton.href =
            game.website;

    } else {

        officialSiteButton.href =
            "#";

    }


    // --------------------------------------
    // FAVORITO
    // --------------------------------------

    updateModalFavoriteButton();

}


// ==========================================
// FECHAR MODAL
// ==========================================

function closeGameModal() {

    gameModal.classList.remove(
        "active"
    );

    gameModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


modalClose.addEventListener(
    "click",
    closeGameModal
);


modalOverlay.addEventListener(
    "click",
    closeGameModal
);


// ==========================================
// ESC PARA FECHAR
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            gameModal.classList.contains(
                "active"
            )
        ) {

            closeGameModal();

        }

    }
);


// ==========================================
// FAVORITO NO MODAL
// ==========================================

favoriteModalButton.addEventListener(
    "click",
    () => {

        if (!currentGameId) {
            return;
        }


        toggleFavorite(
            currentGameId
        );


        updateModalFavoriteButton();

    }
);


function updateModalFavoriteButton() {

    const isFavorite =
        favorites.includes(
            currentGameId
        );


    favoriteModalButton.textContent =
        isFavorite
            ? "❤️ Remover dos favoritos"
            : "❤️ Adicionar aos favoritos";

}


// ==========================================
// TOAST
// ==========================================

let toastTimeout;


function showToast(
    message
) {

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatDate(
    date
) {

    if (!date) {
        return "Data desconhecida";
    }


    const formattedDate =
        new Date(
            date
        );


    return formattedDate.toLocaleDateString(
        "pt-BR"
    );

}


// ==========================================
// LOADING
// ==========================================

function showLoading(
    element
) {

    if (!element) {
        return;
    }


    element.style.display =
        "flex";

}


function hideLoading(
    element
) {

    if (!element) {
        return;
    }


    element.style.display =
        "none";

}


// ==========================================
// BOTÕES "VER TODOS"
// ==========================================

const seePopularButton =
    document.getElementById(
        "seePopularButton"
    );


const seeNewestButton =
    document.getElementById(
        "seeNewestButton"
    );


seePopularButton.addEventListener(
    "click",
    () => {

        searchResultsSection
            .classList
            .add("visible");


        searchResultsTitle.textContent =
            "Jogos populares";


        resultsCount.textContent =
            `${games.length} jogos`;


        const popular =
            [...games]
                .sort(
                    (a, b) =>
                        b.rating - a.rating
                );


        renderGames(
            popular,
            searchResultsGrid
        );


        searchEmptyState.style.display =
            "none";


        searchResultsSection
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


seeNewestButton.addEventListener(
    "click",
    () => {

        searchResultsSection
            .classList
            .add("visible");


        searchResultsTitle.textContent =
            "Lançamentos";


        const newest =
            [...games]
                .sort(
                    (a, b) =>
                        new Date(b.releaseDate) -
                        new Date(a.releaseDate)
                );


        resultsCount.textContent =
            `${newest.length} jogos`;


        renderGames(
            newest,
            searchResultsGrid
        );


        searchEmptyState.style.display =
            "none";


        searchResultsSection
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


// ==========================================
// MENU MOBILE
// ==========================================

mobileMenuButton.addEventListener(
    "click",
    () => {

        const navigation =
            document.querySelector(
                ".navigation"
            );


        const isOpen =
            navigation.classList.toggle(
                "mobile-open"
            );


        if (isOpen) {

            navigation.style.display =
                "flex";

            navigation.style.position =
                "absolute";

            navigation.style.top =
                "72px";

            navigation.style.left =
                "0";

            navigation.style.right =
                "0";

            navigation.style.padding =
                "20px";

            navigation.style.flexDirection =
                "column";

            navigation.style.background =
                "#0d1019";

            navigation.style.borderBottom =
                "1px solid rgba(255,255,255,0.08)";

        } else {

            navigation.style.display =
                "";

        }

    }
);


// ==========================================
// FECHAR MENU MOBILE AO CLICAR
// ==========================================

document.querySelectorAll(
    ".nav-link"
).forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                const navigation =
                    document.querySelector(
                        ".navigation"
                    );


                navigation.classList.remove(
                    "mobile-open"
                );


                navigation.style.display =
                    "";

            }
        );

    }
);
