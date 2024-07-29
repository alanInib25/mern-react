describe('Peple app', () => {
  it('Visit front page', () => {
    cy.visit('http://localhost:5173/');
    cy.contains("discover the new and be surprised by people's");
  })
})