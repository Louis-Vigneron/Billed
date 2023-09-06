/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression      
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on the eye icon", () => {
      test("Then modal would be open", () => {
        // Create a new instance of the Bills class
        const bill = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })

        // Set the HTML content of the document body with bills data
        document.body.innerHTML = BillsUI({ data: bills })

        // Mock the modal function using jest
        $.fn.modal = jest.fn();

        // Create a new DOM element representing an icon
        const icon = document.createElement("div");

        // Create a spy to track the 'handleClickIconEye' method of the 'bill' instance
        const spy = jest.spyOn(bill, 'handleClickIconEye');

        // Create a new function 'handleClickIconEye' that calls the original method
        const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(icon));

        // Add a click event listener to the icon, which will trigger the 'handleClickIconEye' function
        icon.addEventListener('click', handleClickIconEye);

        // Simulate a click on the icon
        icon.click();

        // Expect the 'handleClickIconEye' method to have been called
        expect(spy).toHaveBeenCalled();

        // Restore the original method after the test
        spy.mockRestore();
      })
    })

    describe("When I click on button new bill", () => {
      test("Then redirect on NewBill page", () => {
        // Create a mock function for the 'onNavigate' method
        const mockOnNavigate = jest.fn();

        // Create an instance of the 'Bills' class, passing the mock 'onNavigate' function
        const bill = new Bills({
          document,
          onNavigate: mockOnNavigate,
          store: null,
          localStorage: window.localStorage
        });

        // Call the 'handleClickNewBill' method of the 'bill' instance
        bill.handleClickNewBill();

        // Expect that the 'onNavigate' method was called with the specified route
        expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
      })
    })

    describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET",async ()=>{
      $.fn.modal = jest.fn();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)      
      const content = await screen.getByTestId("tbody")
      expect(content).toBeTruthy()   
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
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
  
      test("fetches messages from an API and fails with 500 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
   
  })
  })
})

