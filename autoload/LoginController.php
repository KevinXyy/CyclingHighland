<?php

class LoginController
{
    function render($f3) {
        // Check for flash message in session
        $error = $f3->get('SESSION.error');
        $f3->clear('SESSION.error'); // Clear the error message after retrieving it

        // Pass the error message to the template, if any
        $f3->set('error', $error);

        echo Template::instance()->render('login.html');
    }

    function login($f3)
    {
        $db = $f3->get('DB');
        $username = $f3->get('POST.username');
        $password = $f3->get('POST.password');

        $result = $db->exec('SELECT password FROM users WHERE username = ?', $username);

        if (!$result) {
            // Username does not exist
            echo json_encode(['success' => false, 'message' => 'Invalid username']);
        } else {
            $hashed_password = $result[0]['password'];
            if (password_verify($password, $hashed_password)) {
                // Password is correct
                $f3->set('SESSION.xuehao', $username);
                echo json_encode(['success' => true, 'message' => 'Login successful']);
            } else {
                // Password is wrong
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
        }
    }
}
