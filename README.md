users [icon: user, color: blue] {
  id string pk
  name string
  email string
  password string
  accesstoken string
}

FormData [icon: users, color: blue] {
  id string pk
  option string
  Dnaimage string
}


-http://localhost:8000/api/v1/user/register