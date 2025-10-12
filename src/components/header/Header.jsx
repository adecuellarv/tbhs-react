import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { SquareMenu, Bell, Gift, ShoppingCart, CircleQuestionMark } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Header = () => {
  return (
    <Disclosure as="nav" className="relative bg-gray-800">
      <div className="mx-auto  px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">

          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <a
              type="button"
              className="relative rounded-full p-1 text-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
              href='https://thebesthairsalon.com.mx/ayuda'
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">FAQ</span>
              <CircleQuestionMark aria-hidden="true" className="size-6" />
            </a>
            <a
              type="button"
              className="relative rounded-full p-1 text-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
              href='https://thebesthairsalon.com.mx/clientes/cumple'
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <Bell aria-hidden="true" className="size-6" />
            </a>
            <a
              type="button"
              className="relative rounded-full p-1 text-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
              href='https://thebesthairsalon.com.mx/clientes/cumple'
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Obsequios</span>
              <Gift aria-hidden="true" className="size-6" />
            </a>
            <button
              type="button"
              className="relative rounded-full p-1 text-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Carrito</span>
              <ShoppingCart aria-hidden="true" className="size-6" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <a
                    href="https://thebesthairsalon.com.mx/perfil/mi"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                   Mi Perfil
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="https://thebesthairsalon.com.mx/configuracion"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                    Configuración
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="https://thebesthairsalon.com.mx/registro/nuevo"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                    Nuevo salon
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                    Salir
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
      </DisclosurePanel>
    </Disclosure>
  )
};

export default Header;