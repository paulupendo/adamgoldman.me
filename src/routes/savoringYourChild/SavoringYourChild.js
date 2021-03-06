// @flow

import React from 'react'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import axios from 'axios'

import { TYPEFORM_ID_SAVORING_INTRO } from '../../constants'
import Benefits from '../../components/Benefits'
import Typeform from '../../components/Typeform'
import Testimonials from '../../components/Testimonials'
import GetStarted from '../../components/GetStartedButton'
import MessageMe from '../../components/MessageMe'
import FbGateKeeper from '../../components/FbGateKeeper'
import SavoringYourChildModulesComponent from '../../components/SavoringYourChildModulesComponent'
import { modules } from '../savoringYourChildModules/data'


import FAQContainer from './FAQContainer'
import s from './SavoringYourChild.css'
import { testimonials } from './data'

type Props = {
  user: Object,
  onLogin: Function,
  onSubmitIntro: Function,
}

const SavoringYourChild = ({ user, onLogin, onSubmitIntro }: Props) => (
  <div>
    <div className="container">
      <div className="mainheading">
        <h1 className="sitetitle text-center">How to honor your child&apos;s memory after the transition</h1>
        <p className="lead text-center">And savor the relationship in a healing way</p>
      </div>
      <div style={{ position: 'relative' }}>
        {user.form && user.form.includes(TYPEFORM_ID_SAVORING_INTRO) ?
          <SavoringYourChildModulesComponent modules={modules} user={user} />
          :
          <Typeform
            data-url={`https://adamgoldman.typeform.com/to/${TYPEFORM_ID_SAVORING_INTRO}?user_id=${user._id}`}
            style={{ width: '100%', height: 500 }}
            onSubmit={() => submit(user._id, onSubmitIntro)}
          />
        }
        {!user._id &&
        <FbGateKeeper onLogin={onLogin} user={user} />
        }
      </div>
      <hr className={s.hr} />
      <section>
        <h1 className="text-center">Parents share ...</h1>
        <Testimonials testimonials={testimonials} />
      </section>
      <GetStarted text="Get Started" />
      <hr className={s.hr} />
      <section>
        <h1 className="text-center">Learn how to ...</h1>
        <div className="row justify-content-md-center">
          <div className="col col-lg-10">
            <Benefits benefits={[
              'Enjoy thinking about your child again',
              'Focus on the good experiences',
              'Feel your child\'s presence even more',
              'Enjoy looking forward to your future',
              'Increase the peace & love in your life',
            ]}
            />
          </div>
        </div>
      </section>
      <hr className={s.hr} />
      <section>
        <FAQContainer />
      </section>
      <hr className={s.hr} />
      <GetStarted text="Get Started" />
      <hr className={s.hr} />
      <MessageMe />
    </div>
  </div>
)

export default withStyles(s)(SavoringYourChild)

async function submit(userid, onSubmitIntro) {
  try {
    const formResponses = await axios.get(`api/typeform/${TYPEFORM_ID_SAVORING_INTRO}`)
    const formData = formResponses.data.responses.filter(res => res.hidden.user_id === userid)[0].answers // eslint-disable-line max-len
    global.console.log('formData', formData)
    const gendersAnswer = formData.list_zdzx5hGmBK40_choice
    onSubmitIntro({
      gender: gendersAnswer.match(/daughter/i) ? 'female' : 'male', // child's gender
      childName: formData.textfield_zdCMkNErETQz, // child's name
      genderParent: gendersAnswer.match(/mother/i) ? 'female' : 'male',
    })
  } catch (err) {
    global.console.error(err)
    global.alert('There was an error, please contact me, sorry for the trouble')
  }
}
