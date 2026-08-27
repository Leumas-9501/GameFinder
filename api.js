// ==========================================
// CONFIGURAÇÃO
// ==========================================

const API_KEY = "5e42adbc6f1e48d5964edf7ee62a05c2";

const BASE_URL = "https://api.rawg.io/api";


// ==========================================
// FUNÇÃO BASE DA API
// ==========================================

async function fetchRAWG(endpoint) {

    try {

        const separator =
            endpoint.includes("?")
                ? "&"
                : "?";

        const response = await fetch(
            `${BASE_URL}${endpoint}${separator}key=${API_KEY}`
        );


        if (!response.ok) {

            throw new Error(
                `Erro HTTP: ${response.status}`
            );

        }


        const data =
            await response.json();


        return data;


    } catch (error) {

        console.error(
            "Erro na API RAWG:",
            error
        );

        return null;

    }

}


// ==========================================
// BUSCAR JOGOS
// ==========================================

async function getGames(options = {}) {

    let endpoint =
        "/games";


    const params =
        new URLSearchParams();


    // --------------------------------------
    // QUANTIDADE
    // --------------------------------------

    params.append(
        "page_size",
        options.pageSize || 20
    );


    // --------------------------------------
    // PESQUISA
    // --------------------------------------

    if (options.search) {

        params.append(
            "search",
            options.search
        );

    }


    // --------------------------------------
    // ORDENAR
    // --------------------------------------

    if (options.ordering) {

        params.append(
            "ordering",
            options.ordering
        );

    }


    // --------------------------------------
    // DATA INICIAL
    // --------------------------------------

    if (options.dates) {

        params.append(
            "dates",
            options.dates
        );

    }


    // --------------------------------------
    // GÊNERO
    // --------------------------------------

    if (options.genres) {

        params.append(
            "genres",
            options.genres
        );

    }


    endpoint +=
        `?${params.toString()}`;


    const data =
        await fetchRAWG(endpoint);


    return data
        ? data.results
        : [];

}


// ==========================================
// BUSCAR JOGO PELO ID
// ==========================================

async function getGameDetails(id) {

    const data =
        await fetchRAWG(
            `/games/${id}`
        );


    return data;

}


// ==========================================
// JOGOS POPULARES
// ==========================================

async function getPopularGames() {

    return await getGames({

        pageSize: 8,

        ordering:
            "-added"

    });

}


// ==========================================
// JOGOS MAIS RECENTES
// ==========================================

async function getNewestGames() {

    return await getGames({

        pageSize: 8,

        ordering:
            "-released"

    });

}


// ==========================================
// JOGOS MAIS BEM AVALIADOS
// ==========================================

async function getTopRatedGames() {

    return await getGames({

        pageSize: 8,

        ordering:
            "-rating"

    });

}


// ==========================================
// PESQUISAR JOGOS
// ==========================================

async function searchGames(query) {

    return await getGames({

        pageSize: 20,

        search: query

    });

}

// ==========================================
// ADAPTADOR RAWG → GAMEHUB
// ==========================================

function adaptGame(game) {

    return {

        id: game.id,

        name:
            game.name || "Jogo sem nome",

        rating:
            game.rating
                ? Number(game.rating).toFixed(1)
                : "N/A",

        releaseDate:
            game.released || null,

        genres:
            game.genres
                ? game.genres.map(
                    genre => genre.name
                )
                : [],

        platforms:
            game.platforms
                ? game.platforms.map(
                    platform =>
                        platform.platform.name
                )
                : [],

        developer:
            game.developers &&
            game.developers.length > 0

                ? game.developers[0].name

                : "Desconhecida",

        image:
            game.background_image ||
            "",

        description:
            game.description_raw ||
            "Descrição não disponível.",

        website:
            game.website ||
            "#"

    };

}

// ==========================================
// ADAPTAR LISTA DE JOGOS
// ==========================================

function adaptGames(games) {

    return games.map(
        game => adaptGame(game)
    );

}
