import React from 'react'

const Footer = () => {
  return (
    <div className='text-[#737373] md:px-10'>
        <div className='py-20'>
        <p>&copy; Developed by KK, Suba, Jansi, Jenci and Catherin</p>
        <p>Watch shows on Netflix</p>
        <p>This is a clone website. All rights belong to Netflix</p>
        <p>Privacy Policy | Terms of Use | Cookie Preferences | Corporate Information</p>
        <p>Netflix India</p>
        </div>


        <p className='pb-5'>Questions? contact Us.</p>

        <div className="grid grid-cols-2 md:grid-cols-4  text-sm pb-10 max-w-5xl">
            <ul className='flex flex-col space-y-2'>
                <li>FAQ</li>
                <li>Investor Relations</li>
                <li>Privacy</li>
                <li>Speed Test</li>
            </ul>

            <ul className='flex flex-col space-y-2'>
                <li>Help Center</li>
                <li>Jobs</li>
                <li>Cookie Preferences</li>
                <li>Legal Notices</li>
            </ul>

            <ul className='flex flex-col space-y-2'>
                <li>Account</li>
                <li>Ways to Watch</li>
                <li>Corporate Information</li>
                <li>Only on Netflix</li>
            </ul>

            <ul className='flex flex-col space-y-2'>
                <li>Media Center</li>
                <li>Terms of Use</li>
                <li>Contact Us</li>
            </ul>
        </div>
    </div>
  )
}

export default Footer