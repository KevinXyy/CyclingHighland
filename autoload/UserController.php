<?php

class UserController
{

    public function registerForm($f3)
    {
        echo Template::instance()->render('register.html');
    }

    public function register($f3)
    {
        $db = $f3->get('DB');
        $username = trim($f3->get('POST.username'));
        $password = $f3->get('POST.password');
        $confirmPassword = $f3->get('POST.confirm_password');

        $response = ['success' => false, 'message' => ''];

        if (empty($username) || empty($password)) {
            $response['message'] = 'Username and password cannot be empty！';
            echo json_encode($response);
            return;
        }

        if ($password !== $confirmPassword) {
            $response['message'] = 'The two passwords you entered mismatched. Please re-enter the passwords!';
            echo json_encode($response);
            return;
        }

        $existingUser = new DB\SQL\Mapper($db, 'users');
        $existingUser->load(['username=?', $username]);

        if (!$existingUser->dry()) {
            $response['message'] = "User: $username already exists! Please re-enter this field.";
            echo json_encode($response);
            return;
        }

        $user = new DB\SQL\Mapper($db, 'users');
        $user->username = $username;
        $user->password = password_hash($password, PASSWORD_DEFAULT);
        $user->save();

        if ($user->_id) {
            $response['success'] = true;
            $response['message'] = 'Sign Up Successful!';
        } else {
            $response['message'] = 'Sign Up Failed';
        }

        echo json_encode($response);
    }
}