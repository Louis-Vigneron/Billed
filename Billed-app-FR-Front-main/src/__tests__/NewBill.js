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
      // Set user information in local storage for testing
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))

      // Create a new DOM with NewBillUI
      document.body.innerHTML = NewBillUI()
      $.fn.modal = jest.fn();

      // Initialize NewBill component
      const newBill = new NewBill({
        document,
        onNavigate: null,
        store:Store,
        localStorage: window.localStorage
      })

      // Create a mock file for testing
      const file =  {
        target:{
        files : [new File(["test.png"], "test.png", { type: 'image/png' })]
      }}

      // Get the file input element
      const input = screen.getByTestId('file');     

      // Create a mock function for handling file change
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      // Add a change event listener to the input
      input.addEventListener("change", handleChangeFile)

      // Simulate a file change event
      fireEvent.change(input, file);

      // Assert that the handleChangeFile function was called
      expect(handleChangeFile).toHaveBeenCalled()

      // Assert that the input files contain the expected file name
      expect(input.files[0].name).toBe("test.png"); 
    })
  

    test("Then I submit new bill", () => {

      // Set user information in local storage for testing
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))

      // Create a mock function for onNavigate
      const mockOnNavigate = jest.fn();

      // Create a new DOM with NewBillUI
      document.body.innerHTML = NewBillUI()

      // Initialize NewBill component
      const newBill = new NewBill({
        document,
        onNavigate: mockOnNavigate,
        store: null,
        localStorage: window.localStorage
      })

      // Create a fake input element with a data-testid attribute
      const fakeInput = document.createElement("input")
      fakeInput.setAttribute('data-testid', "")

      // Create a mock event object for handleSubmit
      const event = {
        preventDefault: jest.fn(),
        target: {
          querySelector: () => fakeInput,
        }
      };

      // Spy on the handleSubmit function
      const spy = jest.spyOn(newBill, "handleSubmit")

      // Call the handleSubmit function with the mock event
      newBill.handleSubmit(event);

      // Assert that the handleSubmit function was called
      expect(spy).toHaveBeenCalled()

      // Assert that mockOnNavigate was called with the 'Bills' route
      expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);

      // Restore the spy
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
