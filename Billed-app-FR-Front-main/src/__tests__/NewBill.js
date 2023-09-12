/**
 * @jest-environment jsdom
 */

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from '../constants/routes.js'
import Store from '../app/Store.js'
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then I change file with PNG/JPEG/JPG", () => {
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
  

    test("Then I submit new bill", () => {
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
    
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
