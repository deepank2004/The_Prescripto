import React from 'react'
import { assets } from '../../assets/assets'

const AddDoctor = () => {
  return (
    <form className='m-5 w-full'>

        <p className='mb-3 text-lg font-medium'>Add Doctor</p>

        <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
            <div className='flex items-center gap-4 mb-8 text-gray-500'>
                <label htmlFor="doc-img">
                    <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={assets.upload_area} alt="" />
                </label>
                <input type="file" id='doc-img' hidden/>
                <p>Upload Doctor <br />picture</p>
            </div>

            <div className=''>
                <div>
                    <div>
                        <p>Doctor name</p>
                        <input type="text" placeholder='Name' required/>
                    </div>

                    <div>
                        <p>Doctor Email</p>
                        <input type="email" placeholder='Email' required/>
                    </div>

                    <div>
                        <p>Doctor Password</p>
                        <input type="password" placeholder='Password' required/>
                    </div>

                    <div>
                        <p>Experience</p>
                        <select name="" id="">
                            <option value="1 year">1 year</option>
                            <option value="2 year">2 year</option>
                            <option value="3 year">3 year</option>
                            <option value="4 year">4 year</option>
                            <option value="5 year">5 year</option>
                            <option value="6 year">6 year</option>
                            <option value="7 year">7 year</option>
                            <option value="8 year">8 year</option>
                            <option value="9 year">9 year</option>
                            <option value="10 year">10 year</option>
                        </select>
                    </div>

                    <div>
                        <p>Fees</p>
                        <input type="number" placeholder='fees' required/>
                    </div>

                </div>

                <div>
                    <div>
                        <p>Speciality</p>
                        <select name="" id="">
                            <option value="General physician">General physician</option>
                            <option value="Gyneocologist">Gyneocologist</option>
                            <option value="Dermatologist">Dermatologist</option>
                            <option value="Pediatricians">Pediatricians</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Gastroenterologist">Gastroenterologist</option>
                        </select>
                    </div>

                    <div>
                        <p>Education</p>
                        <input type="text" placeholder='Education' required/>
                    </div>

                    <div>
                        <p>Address</p>
                        <input type="text" placeholder='Address1' required/>
                        <input type="text" placeholder='Address2' required/>
                    </div>
                </div>
            </div>

            <div>
                <p>About Doctor</p>
                <textarea placeholder='write about doctor' rows={5} required/>
            </div>

            <button>Add Doctor</button>
        </div>
    </form>
  )
}

export default AddDoctor
