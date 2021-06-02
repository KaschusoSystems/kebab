it('Call login page!', () => {
  cy.intercept('GET', '/api/mandators/', { fixture: 'mandators.json' }).as('getMandators');
  
  cy.visit('http://localhost:8080/login');
  
  cy.wait(['@getMandators']);

  cy.get('#mandator > option').should('have.length', 13);
});

it('Login!', () => {
  cy.intercept('GET', '/api/mandators/', { fixture: 'mandators.json' }).as('getMandators');
  
  cy.visit('http://localhost:8080/login');
  cy.wait(['@getMandators']);

  cy.get('#mandator')
    .select('gibsso')
    .should('have.value', 'gibsso');
      
  cy.get('#username')
    .type('max.muster')
    .should('have.value', 'max.muster');

  cy.get('#password')
    .type('secret')
    .should('have.value', 'secret');

  cy.intercept('POST', '/api/users/login', { fixture: 'login.json' }).as('login');
  cy.intercept('POST', '/api/user/', { fixture: 'user.json' }).as('getUser');
  
  cy.contains('Login')
    .click();
  
  cy.wait(['@login']);

  cy.get('h4').should('have.text', 'Präferenzen 🔗');
});
