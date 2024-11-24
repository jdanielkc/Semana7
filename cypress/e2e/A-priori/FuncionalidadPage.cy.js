

const ghostVersion = Cypress.env('GHOST_VERSION');

describe('Tester de funcionalidad page', () => {
    beforeEach(() => {
        cy.fixture('userLogin.json').then((user) => {
            cy.visit(user.loginPage)
            cy.get('#identification').type(user.email)
            cy.get('#password').type(user.password)
            cy.get('button[data-test-button="sign-in"]').click()
            cy.wait(1500)
            cy.url().should('include', '/dashboard')
        })
    })
    it('E0013 Creando Page con titulo y contenido', () => {

        cy.get('a[data-test-nav="pages"]').click()
        cy.wait(1500)
        cy.url().should('include', '/pages')

        cy.get('a[data-test-new-page-button]').click()
        cy.wait(1500)
        cy.url().should('include', '/editor/page')

        cy.fixture('A-priori/page.json').then((page) => {
            const randomIndex = Math.floor(Math.random() * page.length);
            const pageData = page[randomIndex];
            cy.get('textarea[data-test-editor-title-input]').type(pageData.title)
            cy.get('div[data-lexical-editor="true"]').first().type(pageData.Paragraphs)
            cy.get('button[data-test-button="publish-flow"]').first().click()
            cy.get('button[data-test-button="continue"]').click()
            cy.wait(500)
            cy.get('button[data-test-button="confirm-publish"]').click()
            cy.get('button[data-test-button="close-publish-flow"]').click()
            cy.wait(500)
            cy.url().should('include', '/pages')
            //verificar creacion
            cy.contains('h3', pageData.title).should('exist')
        })
        cy.screenshot(`${ghostVersion}/nueva-page`)
    })

    it('E0014 Creando Page con titulo y sin contenido', () => {

        cy.get('a[data-test-nav="pages"]').click()
        cy.wait(1500)
        cy.url().should('include', '/pages')

        cy.get('a[data-test-new-page-button]').click()
        cy.wait(1500)
        cy.url().should('include', '/editor/page')

        cy.fixture('A-priori/page.json').then((page) => {
            const randomIndex = Math.floor(Math.random() * page.length);
            const pageData = page[randomIndex];
            cy.get('textarea[data-test-editor-title-input]').type(pageData.title)
            cy.get('div[data-lexical-editor="true"]').first().focus()
            cy.wait(500)
            cy.get('button[data-test-button="publish-flow"]').first().click()
            cy.get('button[data-test-button="continue"]').click()
            cy.wait(500)
            cy.get('button[data-test-button="confirm-publish"]').click()
            cy.get('button[data-test-button="close-publish-flow"]').click()
            cy.wait(500)
            cy.url().should('include', '/pages')
            //verificar creacion
            cy.contains('h3', pageData.title).should('exist')
        })

        cy.screenshot(`${ghostVersion}/nueva-page-sin-contenido`)

    })

    it('E0015 Eliminando una Page', () => {
        // Given: El usuario está autenticado y en la página de listado de pages
        cy.get('a[data-test-nav="pages"]').click()
        cy.wait(500)
        cy.url().should('include', '/pages')

        // When: El usuario elimina una página
        cy.get('li.gh-list-row.gh-posts-list-item').then(($divs) => {
            const divsAntes = $divs.length
            cy.wrap(divsAntes).as('divsAntes')
        })

        cy.get('li.gh-list-row.gh-posts-list-item').first().click()

        cy.get('button[title="Settings"]').click()
        cy.wait(500)
        cy.url().should('include', '/editor/page')

        cy.get('button[data-test-button="delete-post"]').click()
        cy.get('button[data-test-button="delete-post-confirm"]').click()
        cy.wait(500)

        // Then: La cantidad de páginas disminuye en uno
        cy.get('li.gh-list-row.gh-posts-list-item').then(($divs) => {
            const divsDespues = $divs.length
            cy.wrap(divsDespues).as('divsDespues')
        })

        cy.get('@divsAntes').then((divsAntes) => {
            cy.get('@divsDespues').then((divsDespues) => {
                expect(divsDespues).to.equal(divsAntes - 1)
            })
        })

        cy.screenshot(`${ghostVersion}/eliminar-page`)

    })

    it('E0016 Editando una Page', () => {
        // Given: El usuario está autenticado y en la página de listado de pages
        cy.get('a[data-test-nav="pages"]').click()
        cy.wait(500)
        cy.url().should('include', '/pages')

        // When: El usuario edita una página
        cy.get('li.gh-list-row.gh-posts-list-item').first().click()
        cy.get('button[title="Settings"]').click()
        cy.wait(500)
        cy.url().should('include', '/editor/page')
        cy.fixture('A-priori/page.json').then((page) => {
            const randomIndex = Math.floor(Math.random() * page.length);
            const pageData = page[randomIndex];
            cy.get('textarea[data-test-editor-title-input]').clear()
            cy.get('textarea[data-test-editor-title-input]').type(pageData.title)
            cy.get('button[data-test-button="publish-save"]').first().click({force: true})
            cy.get('a[href="#/pages/"]').click()
            cy.wait(500)
            cy.url().should('include', '/pages')

            // Then: La página editada aparece en la lista de pages
            cy.contains('h3', pageData.title).should('exist')
            cy.screenshot(`${ghostVersion}/editar-page`)
        })

    })

    it('E0017 Creando un page con un titulo mayor a 255 caracteres', () => {
        // Given: El usuario está autenticado y en la página de creación de pages
        cy.get('a[data-test-nav="pages"]').click()
        cy.wait(1500)
        cy.url().should('include', '/pages')

        cy.get('a[data-test-new-page-button]').click()
        cy.wait(1500)
        cy.url().should('include', '/editor/page')

        // When: El usuario crea una nueva página con un título mayor a 250 caracteres
        cy.fixture('A-priori/page.json').then((page) => {
            const randomIndex = Math.floor(Math.random() * page.length);
            const pageData = page[randomIndex];
            cy.get('div[data-lexical-editor="true"]').first().type(pageData.Paragraphs)
            cy.get('textarea[data-test-editor-title-input]').type(pageData.large_title)
            cy.get('div[data-lexical-editor="true"]').first().click()
            cy.get('button[data-test-button="publish-flow"]').first().click()
            cy.wait(500)

            // Then: El mensaje de error se muestra en la pantalla
            cy.contains('div', "Validation failed: Title cannot be longer than 255 characters.").should('exist')
            cy.screenshot(`${ghostVersion}/nueva-page-titulo-invalido`)
        })
    })
})