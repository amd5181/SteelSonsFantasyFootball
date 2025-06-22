'use client';
import Link from 'next/link';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Message Board', path: '/' },
  { name: 'Trade Block', path: '/trade-block' },
  { name: 'League History', path: '/league-history' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white shadow-md px-4 py-3 flex items-center justify-between">
      <button onClick={() => setOpen(true)}>
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>

      <h1 className="text-xl font-bold">Steel Sons Fantasy</h1>

      <div className="w-6" /> {/* Spacer */}

      {/* Mobile Drawer */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative w-64 max-w-xs bg-white h-full shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-bold text-gray-800">Menu</span>
                  <button onClick={() => setOpen(false)}>
                    <XMarkIcon className="h-5 w-5 text-black" />
                  </button>
                </div>

                <nav className="p-4 space-y-4">
                  {navItems.map(({ name, path }) => (
                    <Link
                      key={name}
                      href={path}
                      onClick={() => setOpen(false)}
                      className="block text-gray-800 hover:text-blue-600 text-lg"
                    >
                      {name}
                    </Link>
                  ))}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </header>
  );
}
