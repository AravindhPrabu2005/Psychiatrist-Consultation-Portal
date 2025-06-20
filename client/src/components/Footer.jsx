import React from "react";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* -----Left Section----- */}
        <div>
          <img className="mb-5 w-40" src="/logo.png" alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            PsyCare is a modern online psychiatrist appointment portal designed to connect individuals with trusted mental health professionals. Our platform makes it easy to find, consult, and book appointments with licensed psychiatrists from the comfort of your home—ensuring privacy, convenience, and timely care for your mental well-being.

          </p>
        </div>

        {/* -----Center Section----- */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About</li>
            <li>Contact us</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        {/* -----Right Section----- */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+0-000-000-000</li>
            <li>PsyCare@gmail.com</li>
          </ul>
        </div>
      </div>
      {/* -----Copyright Section----- */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright 2025 @ PsyCare - All Right Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
