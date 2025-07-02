import React from "react";

const Footer = () => {
  return (
    <div className="px-6 sm:px-10 md:px-20 lg:px-24">
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr] gap-10 lg:gap-14 my-10 mt-40 text-sm">
        <div>
          <img className="mb-5 w-32 sm:w-40" src="/logo.png" alt="" />
          <p className="text-gray-600 leading-6">
            PsyCare is a modern online psychiatrist appointment portal designed to connect individuals with trusted mental health professionals. Our platform makes it easy to find, consult, and book appointments with licensed psychiatrists from the comfort of your home—ensuring privacy, convenience, and timely care for your mental well-being.
          </p>
        </div>

        <div>
          <p className="text-lg font-medium mb-4">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About</li>
            <li>Contact us</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className="text-lg font-medium mb-4">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+0-000-000-000</li>
            <li>PsyCare@gmail.com</li>
          </ul>
        </div>
      </div>

      <hr />
      <p className="py-5 text-sm text-center text-gray-500">
        Copyright 2025 @ PsyCare - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
