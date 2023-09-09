/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from '../constants/routes.js'
import Store from '../app/Store.js'

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then I change file", () => {
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML = NewBillUI()
      $.fn.modal = jest.fn();
    
      const newBill = new NewBill({
        document,
        onNavigate: null,
        store:Store,
        localStorage: window.localStorage
      })

      const file =  {
        target:{
        files : [new File(["test.png"], "test.png", { type: 'image/png' })]
      }}
      const input = screen.getByTestId('file');     
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      input.addEventListener("change", handleChangeFile)
      fireEvent.change(input, file);
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe("test.png"); 
    })

    test("Then I submit", () => {
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const mockOnNavigate = jest.fn();
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document,
        onNavigate: mockOnNavigate,
        store: null,
        localStorage: window.localStorage
      })
      const fakeInput = document.createElement("input")
      fakeInput.setAttribute('data-testid', "")
      const event = {
        preventDefault: jest.fn(),
        target: {
          querySelector: () => fakeInput,
        }
      };
      const spy = jest.spyOn(newBill, "handleSubmit")
      newBill.handleSubmit(event);
      expect(spy).toHaveBeenCalled()
      expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
      spy.mockRestore();
    })

    // test d'intégration POST
    test("Then I POST new Bill", ()=>{

    })
    
  })
})
